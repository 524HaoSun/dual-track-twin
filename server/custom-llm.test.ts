/**
 * Validates the custom LLM API credentials are set and the endpoint is reachable.
 */
import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Custom LLM API credentials", () => {
  it("should have CUSTOM_LLM_API_URL configured", () => {
    expect(ENV.customLlmApiUrl).toBeTruthy();
    expect(ENV.customLlmApiUrl).toContain("http");
  });

  it("should have CUSTOM_LLM_API_KEY configured", () => {
    expect(ENV.customLlmApiKey).toBeTruthy();
    expect(ENV.customLlmApiKey.length).toBeGreaterThan(10);
  });

  it("should successfully call the custom LLM API", async () => {
    const apiKey = ENV.customLlmApiKey;
    const apiUrl = ENV.customLlmApiUrl;
    if (!apiKey || !apiUrl) {
      console.warn("Skipping live API test — credentials not set");
      return;
    }

    const endpoint = apiUrl.replace(/\/+$/, "") + "/v1/chat/completions";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mimo-v2.5",
        messages: [{ role: "user", content: "Reply with exactly the word: OK" }],
        max_tokens: 600,
        temperature: 0,
      }),
    });

    expect(res.ok).toBe(true);
    const json = await res.json() as { choices?: Array<{ message?: { content?: string; reasoning_content?: string } }> };
    const msg = json?.choices?.[0]?.message;
    const content = msg?.content?.trim() || msg?.reasoning_content?.trim();
    expect(content).toBeTruthy();
    console.log("[CustomLLM] Test response:", content);
  }, 15000);
});
