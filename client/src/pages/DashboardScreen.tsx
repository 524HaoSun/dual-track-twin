/**
 * DashboardScreen — Dual-Track Digital Twin Hero
 * finesse-skill product UI | dark #0A0E14 | cyan #0EA5E9 | gold #F59E0B
 * Tabs: Weekly scenarios | Annual baseline (2016)
 * DM Sans + JetBrains Mono
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell
} from 'recharts';
import { useData } from '@/contexts/DataContext';
import { type ScenarioKey, SCENARIO_LABELS } from '@/lib/demoData';
import { Play, Pause, RotateCcw } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFullTime(ts: string): string {
  const d = new Date(ts);
  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  const h = d.getHours().toString().padStart(2, '0');
  return `${day} ${h}:00`;
}

function formatHour(ts: string): string {
  const d = new Date(ts);
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  if (d.getHours() === 0) return day;
  return '';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function AnimatedNumber({ value, suffix = '', prefix = '', decimals = 0, color }: {
  value: number; suffix?: string; prefix?: string; decimals?: number; color?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const duration = 700;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (end - start) * ease);
      if (t < 1) requestAnimationFrame(tick);
      else prevRef.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span style={color ? { color } : {}}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KPICard({ label, value, suffix, prefix, decimals, color, sparkData, sparkColor, note }: {
  label: string; value: number; suffix?: string; prefix?: string; decimals?: number;
  color?: string; sparkData?: number[]; sparkColor?: string; note?: string;
}) {
  const sd = sparkData ?? [];
  const max = Math.max(...sd);
  const min = Math.min(...sd);
  const range = max - min || 1;
  const w = 64, h = 24;
  const pts = sd.map((v, i) => `${(i / (sd.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');

  return (
    <div
      className="flex-1 min-w-0 rounded-lg p-4"
      style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A9BB5', marginBottom: '8px' }}>
        {label}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: color ?? '#E8EDF5' }}>
          <AnimatedNumber value={value} suffix={suffix} prefix={prefix} decimals={decimals ?? 0} />
        </div>
        {sd.length > 1 && (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0 mb-0.5">
            <defs>
              <linearGradient id={`spark-${label.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sparkColor ?? '#0EA5E9'} stopOpacity="0.25" />
                <stop offset="100%" stopColor={sparkColor ?? '#0EA5E9'} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#spark-${label.replace(/\s/g,'')})`} />
            <polyline points={pts} fill="none" stroke={sparkColor ?? '#0EA5E9'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {note && (
        <div style={{ fontSize: '10px', color: '#8A9BB5', marginTop: '5px' }}>{note}</div>
      )}
    </div>
  );
}

// ── Confidence Gauge ──────────────────────────────────────────────────────────

function ConfidenceGauge({ bandPct, ashraePass }: { bandPct: number; ashraePass: boolean }) {
  const r = 42, cx = 52, cy = 52;
  const startAngle = 225;
  const sweepAngle = 270;
  const fillFraction = Math.max(0, Math.min(1, 1 - (bandPct - 8) / 80));
  const fillAngle = sweepAngle * fillFraction;

  function polarToXY(angle: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(startDeg: number, endDeg: number) {
    const s = polarToXY(startDeg);
    const e = polarToXY(endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const trackPath = arcPath(startAngle, startAngle + sweepAngle);
  const fillPath = arcPath(startAngle, startAngle + fillAngle);
  const confidence = Math.round(fillFraction * 100);

  return (
    <div
      className="rounded-lg p-4 flex flex-col items-center"
      style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A9BB5', marginBottom: '8px' }}>
        Model confidence
      </div>
      <svg width="104" height="80" viewBox="0 0 104 80">
        <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" strokeLinecap="round" />
        <path d={fillPath} fill="none" stroke="#0EA5E9" strokeWidth="7" strokeLinecap="round" />
        <text x="52" y="50" textAnchor="middle" fontSize="20" fontWeight="700" fill="#E8EDF5" fontFamily="JetBrains Mono, monospace">
          {confidence}%
        </text>
        <text x="52" y="64" textAnchor="middle" fontSize="9" fill="#8A9BB5" fontFamily="DM Sans, sans-serif">
          {confidence > 70 ? 'High' : confidence > 40 ? 'Medium' : 'Low'}
        </text>
      </svg>
      {ashraePass && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded mt-1"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#F59E0B' }}>ASHRAE G14 pass</span>
        </div>
      )}
      <div style={{ fontSize: '10px', color: '#8A9BB5', marginTop: '6px' }}>band ±{bandPct}%</div>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const items = payload.filter((p: any) => ['actual', 'prediction'].includes(p.dataKey));
  if (!items.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs space-y-1"
      style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
    >
      {items.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span style={{ color: '#8A9BB5' }}>{p.name}:</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#E8EDF5' }}>
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value} kWh
          </span>
        </div>
      ))}
    </div>
  );
}

function AnnualTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs space-y-1"
      style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
    >
      <div style={{ color: '#8A9BB5', marginBottom: '4px' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span style={{ color: '#8A9BB5' }}>{p.name}:</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#E8EDF5' }}>
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value} kWh
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function cellColor(value: number, min: number, max: number): string {
  const t = (value - min) / (max - min || 1);
  let r, g, b;
  if (t < 0.5) {
    const tt = t * 2;
    r = Math.round(10 + (14 - 10) * tt);
    g = Math.round(22 + (165 - 22) * tt);
    b = Math.round(40 + (233 - 40) * tt);
  } else {
    const tt = (t - 0.5) * 2;
    r = Math.round(14 + (245 - 14) * tt);
    g = Math.round(165 + (158 - 165) * tt);
    b = Math.round(233 + (11 - 233) * tt);
  }
  return `rgb(${r},${g},${b})`;
}

function HeatmapView({ matrix, months, hours }: { matrix: number[][]; months: number[]; hours: number[] }) {
  const allVals = matrix.flat().filter(v => v !== null && v !== undefined);
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
      {/* Floating tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 12,
            top: tooltip.y - 36,
            background: '#1A2332',
            border: '1px solid rgba(14,165,233,0.35)',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '11px',
            color: '#E8EDF5',
            pointerEvents: 'none',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          <span style={{ color: '#8A9BB5' }}>{tooltip.label} · </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#0EA5E9' }}>avg {tooltip.value.toFixed(0)} kWh</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <div style={{ width: '28px' }} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${months.length}, 1fr)`, gap: '2px' }}>
          {months.map(m => (
            <div key={m} style={{ fontSize: '9px', color: '#8A9BB5', textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
              {MONTH_LABELS[m - 1]}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, display: 'flex', gap: '6px', minHeight: 0 }}>
        {/* Hour labels */}
        <div style={{ width: '28px', display: 'grid', gridTemplateRows: `repeat(${hours.length}, 1fr)`, gap: '2px' }}>
          {hours.map(h => (
            <div key={h} style={{ fontSize: '8px', color: '#3D4F6A', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
              {h % 4 === 0 ? `${h}h` : ''}
            </div>
          ))}
        </div>

        {/* Cells: rows = hours, cols = months */}
        <div style={{ flex: 1, display: 'grid', gridTemplateRows: `repeat(${hours.length}, 1fr)`, gap: '2px' }}>
          {hours.map((h, hi) => (
            <div key={h} style={{ display: 'grid', gridTemplateColumns: `repeat(${months.length}, 1fr)`, gap: '2px' }}>
              {months.map((m, mi) => {
                const val = matrix[mi]?.[hi] ?? null;
                if (val === null || val === undefined) {
                  return <div key={m} style={{ background: '#0A0E14', border: '1px solid rgba(255,255,255,0.03)' }} />;
                }
                const label = `${MONTH_LABELS[m - 1]} ${h.toString().padStart(2,'0')}:00`;
                return (
                  <div
                    key={m}
                    style={{
                      background: cellColor(val, min, max),
                      border: '1px solid rgba(0,0,0,0.2)',
                      borderRadius: '1px',
                      cursor: 'crosshair',
                    }}
                    onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, label, value: val })}
                    onMouseMove={(e) => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '9px', color: '#3D4F6A' }}>Low</span>
        <div style={{ width: '80px', height: '6px', borderRadius: '3px', background: 'linear-gradient(to right, #0A1628, #0EA5E9, #F59E0B)' }} />
        <span style={{ fontSize: '9px', color: '#3D4F6A' }}>High</span>
        <span style={{ fontSize: '9px', color: '#3D4F6A', marginLeft: '6px' }}>Workday mean kWh/h</span>
      </div>
    </div>
  );
}

// ── Annual Baseline View ──────────────────────────────────────────────────────

function AnnualBaselineView() {
  const { extra } = useData();
  const [view, setView] = useState<'line' | 'heatmap'>('line');

  if (!extra) return null;

  const { annual, heatmap } = extra;

  // Sample every 3rd day for performance (still 122 points)
  const lineData = annual.dates
    .map((date, i) => ({
      date: formatDate(date),
      actual: annual.actual[i] ?? null,
      design: annual.design[i] ?? null,
    }))
    .filter((_, i) => i % 3 === 0 && annual.actual[i] !== null);

  // Calculate annual gap
  const validActual = annual.actual.filter(v => v !== null);
  const validDesign = annual.design.filter(v => v !== null);
  const annualActualSum = validActual.reduce((a, b) => a + b, 0);
  const annualDesignSum = validDesign.reduce((a, b) => a + b, 0);
  const annualGapPct = Math.round(((annualActualSum - annualDesignSum) / annualDesignSum) * 100);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#E8EDF5', marginBottom: '4px' }}>
            2016 Baseline Year — Daily Energy (kWh)
          </div>
          <div style={{ fontSize: '10px', color: '#8A9BB5' }}>
            {annual.valid_days} valid days · Gap persists year-round (+{annualGapPct}% annual average)
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['line', 'heatmap'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 500,
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: view === v ? 'rgba(14,165,233,0.12)' : 'transparent',
                color: view === v ? '#0EA5E9' : '#8A9BB5',
                borderColor: view === v ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.08)',
              }}
            >
              {v === 'line' ? 'Daily line' : 'Hour heatmap'}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div
        style={{
          padding: '6px 10px',
          borderRadius: '4px',
          background: 'rgba(14,165,233,0.05)',
          border: '1px solid rgba(14,165,233,0.12)',
          fontSize: '10px',
          color: '#8A9BB5',
          flexShrink: 0,
        }}
      >
        {annual.note}
      </div>

      {/* Chart area */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {view === 'line' ? (
          <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lineData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="annualActualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="annualGapGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#3D4F6A', fontFamily: 'DM Sans, sans-serif' }}
                tickLine={false}
                axisLine={false}
                interval={20}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#3D4F6A', fontFamily: 'DM Sans, sans-serif' }}
                tickLine={false}
                axisLine={false}
                width={38}
                tickCount={5}
              />
              <Tooltip content={<AnnualTooltip />} />
              {/* Gap fill */}
              <Area dataKey="actual" fill="url(#annualGapGrad)" stroke="none" legendType="none" />
              <Area dataKey="design" fill="#111827" stroke="none" legendType="none" />
              {/* Design dashed */}
              <Line
                dataKey="design"
                stroke="#3D4F6A"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                name="Design estimate"
              />
              {/* Actual solid */}
              <Area
                dataKey="actual"
                fill="url(#annualActualGrad)"
                stroke="#0EA5E9"
                strokeWidth={1.5}
                dot={false}
                name="Actual (2016)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <HeatmapView matrix={heatmap.matrix} months={heatmap.months} hours={heatmap.hours} />
        )}
      </div>

      {/* Legend for line view */}
      {view === 'line' && (
        <div className="flex items-center gap-4 flex-shrink-0" style={{ fontSize: '10px', color: '#8A9BB5' }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 rounded" style={{ background: '#0EA5E9' }} />
            Actual (2016)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5" style={{ borderTop: '1.5px dashed #3D4F6A' }} />
            Design estimate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-2.5 rounded-sm" style={{ background: 'rgba(245,158,11,0.25)' }} />
            Gap (+{annualGapPct}% annual)
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export function DashboardScreen() {
  const { data } = useData();
  const [activeTab, setActiveTab] = useState<'weekly' | 'annual'>('weekly');
  const [scenario, setScenario] = useState<ScenarioKey>('cold_snap');
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenarioData = data?.scenarios[scenario];
  const kpis = data?.kpis;

  const chartData = scenarioData
    ? scenarioData.timestamps.map((ts, i) => ({
        idx: i,
        time: formatHour(ts),
        ts,
        actual: scenarioData.actual[i],
        prediction: scenarioData.stages.S4.p[i],
        lo: scenarioData.stages.S4.lo[i],
        hi: scenarioData.stages.S4.hi[i],
        gapTop: Math.max(scenarioData.actual[i], scenarioData.stages.S4.p[i]),
        gapBot: Math.min(scenarioData.actual[i], scenarioData.stages.S4.p[i]),
      }))
    : [];

  const startPlay = useCallback(() => {
    setPlaying(true);
    playRef.current = setInterval(() => {
      setCursor(prev => {
        if (prev >= 167) {
          setPlaying(false);
          if (playRef.current) clearInterval(playRef.current);
          return 167;
        }
        return prev + 1;
      });
    }, 60);
  }, []);

  const stopPlay = useCallback(() => {
    setPlaying(false);
    if (playRef.current) clearInterval(playRef.current);
  }, []);

  useEffect(() => {
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, []);

  useEffect(() => {
    setCursor(0);
    setPlaying(false);
    if (playRef.current) clearInterval(playRef.current);
  }, [scenario]);

  if (!data || !kpis || !scenarioData) return null;

  const gapSpark = [30, 35, 38, 40, 42, 42, 42];
  const cvrmseSpark = [47.6, 44.0, 41.2, 35.2, 8.3];
  const bandSpark = [84, 38, 36, 41, 13];

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ padding: '14px 16px', gap: '12px', background: '#0A0E14', overflow: 'hidden' }}
    >
      {/* KPI Strip */}
      <div className="flex gap-3 flex-shrink-0">
        <KPICard
          label="Performance gap"
          value={kpis.performance_gap_pct}
          prefix="+"
          suffix="%"
          color="#F59E0B"
          sparkData={gapSpark}
          sparkColor="#F59E0B"
          note={`Actual ${(kpis.actual_kwh / 1000).toFixed(0)}k kWh vs design ${(kpis.design_kwh / 1000).toFixed(0)}k kWh`}
        />
        <KPICard
          label="Model error CV-RMSE"
          value={kpis.final_cvrmse}
          suffix="%"
          decimals={1}
          color="#0EA5E9"
          sparkData={cvrmseSpark}
          sparkColor="#0EA5E9"
          note={`NMBE ${kpis.final_nmbe}% · ASHRAE G14 pass`}
        />
        <KPICard
          label="Prediction band"
          value={kpis.final_band_pct}
          prefix="±"
          suffix="%"
          color="#10B981"
          sparkData={bandSpark}
          sparkColor="#10B981"
          note="80% confidence interval"
        />
      </div>

      {/* Chart + right column */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Chart card */}
        <div
          className="flex-1 min-w-0 rounded-lg flex flex-col"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}
        >
          {/* Tab switcher */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex gap-1">
              {([['weekly', 'Weekly scenarios'], ['annual', '2016 Annual baseline']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 500,
                    border: '1px solid',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: activeTab === key ? 'rgba(14,165,233,0.12)' : 'transparent',
                    color: activeTab === key ? '#0EA5E9' : '#8A9BB5',
                    borderColor: activeTab === key ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.06)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'weekly' && (
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#E8EDF5' }}>
                  {scenarioData.mean_airTemp}°C avg
                </span>
                <span style={{ color: '#3D4F6A' }}>·</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600, color: '#F59E0B' }}>
                  +{scenarioData.week_gap_pct}% gap
                </span>
              </div>
            )}
          </div>

          {activeTab === 'annual' ? (
            <AnnualBaselineView />
          ) : (
            <>
              {/* Weekly chart legend */}
              <div className="flex items-center gap-4 mb-3 flex-shrink-0" style={{ fontSize: '10px', color: '#8A9BB5' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#E8EDF5', marginRight: '4px' }}>
                  Energy use intensity (kWh/m²)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-5 h-0.5 rounded" style={{ background: '#0EA5E9' }} />
                  Real (operational)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-5" style={{ borderTop: '1.5px dashed #3D4F6A' }} />
                  Design prediction
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-2.5 rounded-sm" style={{ background: 'rgba(245,158,11,0.25)' }} />
                  Gap (+{scenarioData.week_gap_pct}%)
                </span>
              </div>

              {/* Cursor data badge — shown during play or when cursor > 0 */}
              {cursor > 0 && chartData[cursor] && (() => {
                const d = chartData[cursor];
                const actual = d.actual ?? 0;
                const pred = d.prediction ?? 0;
                const diffPct = pred > 0 ? Math.round(((actual - pred) / pred) * 100) : 0;
                const ts = d.ts;
                return (
                  <div
                    className="flex items-center gap-3 mb-2 flex-shrink-0"
                    style={{
                      background: 'rgba(10,14,20,0.92)',
                      border: '1px solid rgba(245,158,11,0.35)',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Time */}
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#F59E0B', fontWeight: 600, letterSpacing: '0.02em' }}>
                      ▶ {ts ? formatFullTime(ts) : ''}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '12px' }}>│</span>
                    {/* Actual */}
                    <span style={{ fontSize: '10px', color: '#8A9BB5' }}>Actual</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#0EA5E9', fontWeight: 700 }}>
                      {actual.toFixed(1)} kWh
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '12px' }}>│</span>
                    {/* Predicted */}
                    <span style={{ fontSize: '10px', color: '#8A9BB5' }}>Predicted</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#3D4F6A', fontWeight: 700 }}>
                      {pred.toFixed(1)} kWh
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '12px' }}>│</span>
                    {/* Gap */}
                    <span style={{ fontSize: '10px', color: '#8A9BB5' }}>Gap</span>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: diffPct > 0 ? '#F59E0B' : '#10B981',
                    }}>
                      {diffPct > 0 ? '+' : ''}{diffPct}%
                    </span>
                  </div>
                );
              })()}

              {/* Chart */}
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3D4F6A" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#3D4F6A" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.04" />
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
                    <YAxis
                      tick={{ fontSize: 9, fill: '#3D4F6A', fontFamily: 'DM Sans, sans-serif' }}
                      tickLine={false}
                      axisLine={false}
                      width={38}
                      tickCount={5}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area dataKey="hi" fill="url(#bandGrad)" stroke="none" legendType="none" />
                    <Area dataKey="lo" fill="#0A0E14" stroke="none" legendType="none" />
                    <Area dataKey="gapTop" fill="url(#gapGrad)" stroke="none" legendType="none" />
                    <Area dataKey="gapBot" fill="#111827" stroke="none" legendType="none" />
                    <Line
                      dataKey="prediction"
                      stroke="#3D4F6A"
                      strokeWidth={1.5}
                      strokeDasharray="5 3"
                      dot={false}
                      name="Design prediction"
                    />
                    <Area
                      dataKey="actual"
                      fill="url(#actualGrad)"
                      stroke="#0EA5E9"
                      strokeWidth={2}
                      dot={false}
                      name="Real (operational)"
                    />
                    {cursor > 0 && cursor < 168 && (
                      <ReferenceLine
                        x={cursor}
                        stroke="#F59E0B"
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                        opacity={0.8}
                        label={{ value: `▶ ${chartData[cursor]?.time || ''}`, fill: '#F59E0B', fontSize: 9, position: 'insideTopRight' }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Scenario + slider row */}
              <div className="flex items-center gap-4 mt-3 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  {(Object.keys(SCENARIO_LABELS) as ScenarioKey[]).map(key => (
                    <button
                      key={key}
                      onClick={() => setScenario(key)}
                      className="scenario-pill"
                      style={scenario === key ? {
                        background: 'rgba(14,165,233,0.12)',
                        color: '#0EA5E9',
                        borderColor: 'rgba(14,165,233,0.3)',
                      } : {}}
                    >
                      {SCENARIO_LABELS[key]}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span style={{ fontSize: '10px', color: '#8A9BB5', flexShrink: 0 }}>Time</span>
                  <input
                    type="range"
                    min={0}
                    max={167}
                    value={cursor}
                    onChange={e => { stopPlay(); setCursor(Number(e.target.value)); }}
                    className="flex-1"
                  />
                  <button
                    onClick={playing ? stopPlay : startPlay}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium flex-shrink-0"
                    style={{ background: '#0EA5E9', color: '#0A0E14', fontSize: '11px' }}
                  >
                    {playing ? <Pause size={10} /> : <Play size={10} />}
                    {playing ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={() => { stopPlay(); setCursor(0); }}
                    className="p-1.5 rounded transition-all flex-shrink-0"
                    style={{ color: '#8A9BB5' }}
                  >
                    <RotateCcw size={11} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3 flex-shrink-0" style={{ width: '160px' }}>
          <ConfidenceGauge bandPct={kpis.final_band_pct} ashraePass={kpis.ashrae_hourly_pass} />

          {/* Building stats */}
          <div
            className="rounded-lg p-3 flex-1"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A9BB5', marginBottom: '10px' }}>
              Building stats
            </div>
            <div className="space-y-2">
              {[
                { label: 'Weekday mean', value: `${kpis.weekday_mean} kWh` },
                { label: 'Weekend mean', value: `${kpis.weekend_mean} kWh` },
                { label: 'Peak hour',    value: `${kpis.peak_kwh} kWh` },
                { label: 'Load factor',  value: `${kpis.load_factor_pct}%` },
                { label: 'Intensity',    value: `${kpis.intensity_kwh_m2} kWh/m²` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-baseline">
                  <span style={{ fontSize: '10px', color: '#8A9BB5' }}>{label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 500, color: '#E8EDF5' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data provenance */}
          <div style={{ fontSize: '9px', color: '#3D4F6A', textAlign: 'center', lineHeight: 1.5 }}>
            Building Data Genome Project 2
          </div>
        </div>
      </div>
    </div>
  );
}
