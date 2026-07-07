/**
 * Act2Screen — Calibration in Motion (Step 2)
 * finesse-skill product UI | dark #0A0E14 | cyan #0EA5E9 | gold #F59E0B
 * Enhanced: animated CV-RMSE countdown + confidence arc animation on inject
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useData } from '@/contexts/DataContext';
import { useNav } from '@/contexts/NavContext';
import { ChevronDown } from 'lucide-react';

const STAGES = ['S0','S1','S2','S3','S4'] as const;
type Stage = typeof STAGES[number];

const STAGE_LABELS: Record<Stage, string> = {
  S0: 'Design assumptions',
  S1: 'Weather aligned',
  S2: 'Schedules calibrated',
  S3: 'Loads calibrated',
  S4: 'Fully calibrated',
};

function formatHour(ts: string): string {
  const d = new Date(ts);
  if (d.getHours() === 0) return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  return '';
}

/** Smooth numeric counter that animates from prev to new value */
function AnimNum({ value, decimals = 1, color }: { value: number; decimals?: number; color?: string }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const start = prev.current, end = value, dur = 600, t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / dur, 1);
      setDisp(start + (end - start) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick); else prev.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span style={color ? { color } : {}}>{disp.toFixed(decimals)}</span>;
}

/** Animated confidence arc — accepts an animated fraction (0-1) */
function ConfidenceArc({ animFraction }: { animFraction: number }) {
  const r = 38, cx = 48, cy = 48;
  const confidence = Math.round(animFraction * 100);
  const sweep = 270;
  const startAngle = 225;

  function polar(deg: number) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function arc(s: number, e: number) {
    const sp = polar(s), ep = polar(e);
    return `M ${sp.x} ${sp.y} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${ep.x} ${ep.y}`;
  }

  // Color transitions: below 70% = amber, 70-85% = cyan, above 85% = green
  const arcColor = confidence >= 85 ? '#10B981' : confidence >= 70 ? '#0EA5E9' : '#F59E0B';
  const label = confidence >= 85 ? 'High' : confidence >= 70 ? 'Good' : 'Medium';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="96" height="72" viewBox="0 0 96 72">
        {/* Track */}
        <path d={arc(startAngle, startAngle + sweep)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" strokeLinecap="round" />
        {/* Fill */}
        <path d={arc(startAngle, startAngle + sweep * animFraction)} fill="none" stroke={arcColor} strokeWidth="6" strokeLinecap="round" />
        {/* Number */}
        <text x="48" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill="#E8EDF5" fontFamily="JetBrains Mono, monospace">{confidence}%</text>
        {/* Label */}
        <text x="48" y="56" textAnchor="middle" fontSize="8" fill="#8A9BB5" fontFamily="DM Sans, sans-serif">{label}</text>
      </svg>
      <div style={{ fontSize: '10px', color: '#8A9BB5' }}>Confidence</div>
    </div>
  );
}

function ChartTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const items = payload.filter((p: any) => ['actual','prediction'].includes(p.dataKey));
  if (!items.length) return null;
  return (
    <div style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', fontSize: '11px' }}>
      {items.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0, display: 'inline-block' }} />
          <span style={{ color: '#8A9BB5' }}>{p.name}:</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#E8EDF5' }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value} kWh</span>
        </div>
      ))}
    </div>
  );
}

// Expose reset for global R-key
let _act2ResetFn: (() => void) | null = null;
export function resetAct2Screen() { _act2ResetFn?.(); }

export function Act2Screen() {
  const { data } = useData();
  const { setScreen } = useNav();
  const [currentStage, setCurrentStage] = useState<Stage>('S0');
  const [injected, setInjected] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Animated display values for the dramatic countdown
  const [displayCvrmse, setDisplayCvrmse] = useState<number>(47.6);
  const [displayConfidence, setDisplayConfidence] = useState<number>(0.60); // fraction 0-1

  const scenarioData = data?.scenarios.cold_snap;
  const ladder = data?.ladder;

  const stageIdx = STAGES.indexOf(currentStage);
  const ladderEntry = ladder?.find(l => l.stage === currentStage);
  const targetCvrmse = ladderEntry?.cvrmse ?? 47.6;
  const nmbe = ladderEntry?.nmbe ?? 0;

  // Sync display values when stage changes (without inject animation, just normal AnimNum)
  // The dramatic animation only fires on inject button click
  const animFrameRef = useRef<number | null>(null);

  /** Run the 1.5s dramatic animation: CV-RMSE counts down, arc expands */
  function runDramaticAnimation(fromCvrmse: number, toCvrmse: number, fromConf: number, toConf: number) {
    const dur = 1500;
    const t0 = performance.now();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const tick = (now: number) => {
      const raw = (now - t0) / dur;
      const t = Math.min(raw, 1);
      // Ease out cubic for satisfying deceleration
      const eased = 1 - Math.pow(1 - t, 3);

      const cvrmse = fromCvrmse + (toCvrmse - fromCvrmse) * eased;
      const conf = fromConf + (toConf - fromConf) * eased;

      setDisplayCvrmse(cvrmse);
      setDisplayConfidence(conf);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        animFrameRef.current = null;
      }
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }

  // When stage changes normally (without inject), sync display values instantly via AnimNum
  useEffect(() => {
    if (!injected) {
      setDisplayCvrmse(targetCvrmse);
      const conf = Math.max(0, Math.min(1, 1 - (targetCvrmse - 5) / 50));
      setDisplayConfidence(conf);
    }
  }, [targetCvrmse, injected]);

  const handleReset = () => {
    // Cancel any running animation
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    // Restore all state to initial
    setCurrentStage('S0');
    setInjected(false);
    setAnimating(false);
    const s0Cvrmse = ladder?.[0]?.cvrmse ?? 47.6;
    setDisplayCvrmse(s0Cvrmse);
    setDisplayConfidence(Math.max(0, Math.min(1, 1 - (s0Cvrmse - 5) / 50)));
  };

  // Register for global R-key reset
  useEffect(() => {
    _act2ResetFn = handleReset;
    return () => { _act2ResetFn = null; };
  });

  const handleInject = () => {
    if (animating) return;
    setInjected(true);
    setAnimating(true);

    // Capture starting values
    const startCvrmse = displayCvrmse;
    const startConf = displayConfidence;
    const finalCvrmse = ladder ? ladder[ladder.length - 1].cvrmse : 8.3;
    const finalConf = Math.max(0, Math.min(1, 1 - (finalCvrmse - 5) / 50));

    // Start the dramatic 1.5s animation immediately
    runDramaticAnimation(startCvrmse, finalCvrmse, startConf, finalConf);

    // Advance stages in the background (visual chart update)
    let idx = stageIdx;
    const advance = () => {
      if (idx < STAGES.length - 1) {
        idx++;
        setCurrentStage(STAGES[idx]);
        setTimeout(advance, 900);
      } else {
        setAnimating(false);
      }
    };
    setTimeout(advance, 600);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const chartData = scenarioData
    ? scenarioData.timestamps.map((ts, i) => ({
        idx: i,
        ts,
        time: formatHour(ts),
        actual: scenarioData.actual[i],
        prediction: scenarioData.stages[currentStage].p[i],
        lo: scenarioData.stages[currentStage].lo[i],
        hi: scenarioData.stages[currentStage].hi[i],
      }))
    : [];

  if (!data || !scenarioData || !ladder) return null;

  // Determine color based on animated CV-RMSE value
  const cvrmseColor = displayCvrmse <= 15 ? '#10B981' : displayCvrmse <= 30 ? '#0EA5E9' : '#F59E0B';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0A0E14', overflow: 'hidden' }}>
      {/* Left panel */}
      <div style={{ width: '240px', flexShrink: 0, padding: '16px', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A9BB5', marginBottom: '3px' }}>Calibrating with measured data</div>
          <div style={{ fontSize: '11px', color: '#3D4F6A' }}>Cold snap week scenario</div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: '#8A9BB5' }}>
            <span style={{ display: 'inline-block', width: 18, height: 2, borderRadius: 1, background: '#0EA5E9' }} />
            Real (operational)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: '#8A9BB5' }}>
            <span style={{ display: 'inline-block', width: 18, borderTop: '1.5px dashed #3D4F6A' }} />
            Design prediction
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* CV-RMSE display — dramatic animated countdown */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A9BB5', marginBottom: '8px' }}>Model error (CV-RMSE)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: cvrmseColor,
              transition: 'color 300ms ease',
            }}>
              {displayCvrmse.toFixed(1)}%
            </div>
            {stageIdx > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ChevronDown size={14} style={{ color: '#10B981' }} />
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#10B981' }}>
                  {(ladder[0].cvrmse - displayCvrmse).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
          {stageIdx > 0 && (
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#8A9BB5', marginTop: '4px' }}>
              from {ladder[0].cvrmse}%
            </div>
          )}
          <div style={{ fontSize: '10px', color: '#8A9BB5', marginTop: '4px' }}>NMBE: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E8EDF5' }}>{nmbe}%</span></div>
        </div>

        {/* Confidence arc — animated via displayConfidence fraction */}
        <ConfidenceArc animFraction={displayConfidence} />

        {/* Stage selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {STAGES.map((s, i) => {
            const entry = ladder.find(l => l.stage === s);
            const active = s === currentStage;
            const done = i < stageIdx;
            return (
              <button
                key={s}
                onClick={() => setCurrentStage(s)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: active ? 600 : 400,
                  background: active ? 'rgba(14,165,233,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(14,165,233,0.25)' : '1px solid transparent',
                  color: active ? '#0EA5E9' : done ? '#8A9BB5' : '#3D4F6A',
                  cursor: 'pointer', transition: 'all 150ms ease',
                }}
              >
                <span>{s}: {STAGE_LABELS[s]}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
                  {entry?.cvrmse.toFixed(1)}%
                  {done && <span style={{ color: '#10B981', marginLeft: '4px' }}>✓</span>}
                </span>
              </button>
            );
          })}
        </div>

        {/* Inject button */}
        {!injected ? (
          <button onClick={handleInject} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Inject measured data
          </button>
        ) : currentStage === 'S4' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={() => setScreen('ladder')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#10B981' }}>
              View calibration ladder
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              onClick={handleReset}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                padding: '7px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#8A9BB5',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#E8EDF5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#8A9BB5'; }}
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M2 7a5 5 0 1 0 1.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 3.5V7h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Reset demo
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#0EA5E9' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0EA5E9', animation: 'pulse 1s infinite' }} />
            Calibrating... {STAGE_LABELS[currentStage]}
          </div>
        )}
      </div>

      {/* Right chart */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '16px', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#E8EDF5', marginBottom: '5px' }}>Energy use intensity (kWh/m²)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)' }}>
                {currentStage}: {STAGE_LABELS[currentStage]}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8A9BB5' }}>CV-RMSE: {displayCvrmse.toFixed(1)}%</span>
            </div>
          </div>
          {currentStage === 'S4' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '10px', fontWeight: 600, color: '#F59E0B' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ASHRAE G14 pass
            </div>
          )}
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGradA2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="bandGradA2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3D4F6A" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#3D4F6A" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="idx"
                tick={{ fontSize: 9, fill: '#3D4F6A', fontFamily: 'DM Sans, sans-serif' }}
                tickLine={false}
                axisLine={false}
                ticks={[0, 24, 48, 72, 96, 120, 144, 167]}
                tickFormatter={(v: number) => {
                  const ts = chartData[v]?.ts;
                  if (!ts) return '';
                  const d = new Date(ts);
                  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
                }}
              />
              <YAxis tick={{ fontSize: 9, fill: '#3D4F6A', fontFamily: 'DM Sans, sans-serif' }} tickLine={false} axisLine={false} width={38} tickCount={5} />
              <Tooltip content={<ChartTip />} />
              <Area dataKey="hi" fill="url(#bandGradA2)" stroke="none" legendType="none" />
              <Area dataKey="lo" fill="#0A0E14" stroke="none" legendType="none" />
              <Line dataKey="prediction" stroke="#3D4F6A" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Design prediction" />
              <Area dataKey="actual" fill="url(#actualGradA2)" stroke="#0EA5E9" strokeWidth={2} dot={false} name="Real (operational)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px 14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {ladder.map((l, i) => (
              <div key={l.stage} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 600, color: l.stage === currentStage ? '#0EA5E9' : i < stageIdx ? '#10B981' : '#3D4F6A' }}>{l.stage}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: l.stage === currentStage ? '#E8EDF5' : i < stageIdx ? '#10B981' : '#3D4F6A' }}>{l.cvrmse}%</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '10px', color: '#3D4F6A' }}>S0 → S4: {ladder[0].cvrmse}% → {ladder[4].cvrmse}%</div>
        </div>
      </div>
    </div>
  );
}
