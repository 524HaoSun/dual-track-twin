import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

// ── Digital Twin assistant system prompt ──────────────────────────────────────
// Only verified figures from the calibrated LightGBM model. Always hedge with
// "most likely" or "the model suggests". Never invent numbers.
const TWIN_SYSTEM_PROMPT = `You are the Dual-Track Digital Twin assistant for a UK secondary school building (Luz, 14,500 m², built 1975).

VERIFIED FACTS ONLY — use these exact numbers; never invent others:
- Performance gap: +42% (actual 307 kWh vs design 216 kWh per week, cold-snap scenario)
- Cold-snap week gap: +47% (avg outdoor temp 3.3°C)
- Model accuracy after full calibration (S4): CV-RMSE 8.3%, NMBE 0.3% — ASHRAE Guideline 14 pass
- Calibration journey: S0 47.6% → S1 44.0% → S2 41.2% → S3 35.2% → S4 8.3% (83% reduction)
- Prediction band: ±13% (80% confidence)
- Model confidence: 92% (High)
- Top drivers by model feature importance (NOT causal shares of the gap): measured feedback lags 56%, occupant behaviour / schedules 25%, weather 19%
- Baseload: empty building uses 54% of term-time load (holiday weekday 59.6 kWh vs term 110.5 kWh)
- Holiday drop: 46% when building is unoccupied
- Annual gap (2016 baseline year): +44% average, 350 valid days
- Cross-building benchmark: Vasiliki (Office) 3.8%, Terina (Education) 6.0%, Velma (Office) 6.4%, Luz (this building) 8.3%, Carla (Industrial) 17.9%
- Illustrative optimisation: -10.5% annual saving if off-hours base load cut by 30% (NOT a validated saving)
- Data source: Building Data Genome Project 2, model: LightGBM

RULES:
1. Always say "most likely" or "the model suggests" — never claim certainty about causation.
2. Only cite the numbers listed above. If asked for a number not listed, say "I don't have that figure from the calibrated model."
3. Keep answers concise (2-4 sentences). No bullet lists unless the user asks for a breakdown.
4. If asked about the optimisation saving, always add: "This is an illustrative what-if, not a validated saving."
5. The 56/25/19 figures are model feature-importance shares, not causal shares of the performance gap. State this clearly if asked.
6. Never mention the model name, API, or internal implementation details.`;

// ── Scripted fallback answers (used when live API is unavailable) ─────────────
const SCRIPTED: Record<string, { answer: string; tag?: string }> = {
  'Why is energy higher than designed?': {
    answer: 'The twin suggests the main drivers are extended occupancy and higher plug loads, with colder weather also contributing. Term-time weekday mean is 110.5 kWh vs holiday mean of 59.6 kWh — a 46% drop when the building is empty, pointing to occupant behaviour as the primary cause.',
    tag: 'most likely',
  },
  'How accurate is the model?': {
    answer: 'After full calibration (S4), CV-RMSE is 8.3% and NMBE is 0.3% — both well within ASHRAE Guideline 14 thresholds (CV-RMSE < 30%, NMBE < 10%). The 80% prediction band is ±13%. Starting from design assumptions (S0), CV-RMSE was 47.6% — calibration reduced error by 83%.',
    tag: 'verified',
  },
  'What is the baseload?': {
    answer: 'The building uses 54% of its term-time load even when empty (holiday periods). This persistent baseload — approximately 59.6 kWh on holiday weekdays — likely represents always-on systems: server rooms, refrigeration, security, and standby HVAC. Reducing this is the highest-leverage optimisation opportunity.',
    tag: 'key finding',
  },
  'What drove the cold snap gap?': {
    answer: 'During the cold snap week (avg 3.3°C), the performance gap was 47% — higher than the annual average of 42%. Weather variables (airTemp, dewTemp, windSpeed) are model feature-importance shares, not causal shares of the gap. Occupant behaviour and schedules are most likely the primary drivers; weather is most likely secondary, amplifying the gap during colder-than-typical periods.',
    tag: 'weather',
  },
};

// ── Helper: call custom LLM API (OpenAI-compatible) ───────────────────────────
async function callCustomLLM(
  messages: Array<{ role: string; content: string }>
): Promise<string | null> {
  const apiKey = ENV.customLlmApiKey;
  const apiUrl = ENV.customLlmApiUrl;
  if (!apiKey || !apiUrl) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const endpoint = apiUrl.replace(/\/+$/, "") + "/v1/chat/completions";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mimo-v2.5",
        messages,
        max_tokens: 1200,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.error("[CustomLLM] API error:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const json = await res.json() as {
      choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>;
    };
    const msg = json?.choices?.[0]?.message;
    // MiMo V2.5 is a reasoning model: final answer is in `content`,
    // thinking steps are in `reasoning_content`. Use content first, fall back to reasoning.
    const content = msg?.content?.trim() || msg?.reasoning_content?.trim();
    return content || null;
  } catch (err) {
    clearTimeout(timer);
    console.error("[CustomLLM] fetch error:", err);
    return null;
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Ask the Twin — live custom LLM with scripted fallback ────────────────────
  assistant: router({
    ask: publicProcedure
      .input(z.object({ question: z.string().min(1).max(500) }))
      .mutation(async ({ input }) => {
        const { question } = input;

        // 1. Try scripted answer first (exact match)
        const scripted = SCRIPTED[question];
        if (scripted) {
          return { answer: scripted.answer, tag: scripted.tag ?? null, source: "scripted" as const };
        }

        // 2. Try live custom LLM (10s timeout)
        const liveAnswer = await callCustomLLM([
          { role: "system", content: TWIN_SYSTEM_PROMPT },
          { role: "user", content: question },
        ]);
        if (liveAnswer) {
          return { answer: liveAnswer, tag: "most likely" as string | null, source: "live" as const };
        }

        // 3. Fallback
        return {
          answer: `The twin doesn't have a scripted answer for that yet. Based on the calibrated model (CV-RMSE 8.3%), feature-importance shares rank as: measured feedback lags 56%, occupant behaviour 25%, weather 19% (these are model feature-importance shares, not causal shares of the gap). In plain terms: occupant behaviour and schedules are most likely the primary drivers; weather is most likely secondary. Try one of the suggested questions for detailed evidence.`,
          tag: null,
          source: "fallback" as const,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
