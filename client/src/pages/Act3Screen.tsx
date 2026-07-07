/**
 * Act3Screen — Insight + Attribution (Feed back)
 * finesse-skill product UI | dark #0A0E14 | cyan #0EA5E9 | gold #F59E0B
 * Optimisation scenario: real data from demo_data_extra.json with honest disclaimer
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ComposedChart, Line, Area
} from 'recharts';
import { useData } from '@/contexts/DataContext';

const DRIVERS = [
  {
    rank: 1,
    label: 'Occupant behaviour',
    sub: 'Extended hours; higher plug use',
    color: '#0EA5E9',
    evidence: 'Term-time weekday mean 110.5 kWh vs holiday weekday mean 59.6 kWh — a 46% drop when building is unoccupied. Extended occupancy and higher plug loads explain the majority of the gap.',
  },
  {
    rank: 2,
    label: 'Weather',
    sub: 'Colder outdoor temps than TMY',
    color: '#8A9BB5',
    evidence: 'Cold snap week averaged 3.3°C — significantly below typical meteorological year values. Heating demand most likely exceeded design assumptions based on typical meteorological year data. Weather variables (airTemp, dewTemp, windSpeed) are secondary contributors in the model, ranked below occupancy-related features.',
  },
  {
    rank: 3,
    label: 'Equipment / plug loads',
    sub: 'Higher density than assumed',
    color: '#3D4F6A',
    evidence: 'LightGBM feature importance: lag_1h (20.3%), lag_24h (17.8%), lag_168h (17.8%) — load is highly persistent hour to hour, consistent with always-on base loads. This pattern is most likely driven by continuously running systems such as servers, refrigeration, or standby HVAC rather than intermittent occupancy-driven loads.',
  },
];

function DriverCard({ driver, expanded, onToggle }: {
  driver: typeof DRIVERS[0]; expanded: boolean; onToggle: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: '8px',
        background: expanded ? 'rgba(14,165,233,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${expanded ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.06)'}`,
        overflow: 'hidden',
        transition: 'all 200ms ease',
      }}
    >
      <button
        onClick={onToggle}
        style={{ width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}
      >
        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: driver.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 700, color: '#0A0E14' }}>{driver.rank}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#E8EDF5', marginBottom: '2px' }}>{driver.label}</div>
          <div style={{ fontSize: '10px', color: '#8A9BB5' }}>{driver.sub}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#0EA5E9', padding: '2px 6px', borderRadius: '3px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>cite</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }}>
            <path d="M3 4.5l3 3 3-3" stroke="#8A9BB5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div style={{ padding: '0 14px 12px 46px', fontSize: '11px', color: '#8A9BB5', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ paddingTop: '10px' }}>{driver.evidence}</div>
        </div>
      )}
    </div>
  );
}

function BarTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', fontSize: '11px' }}>
      <div style={{ color: '#8A9BB5', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#E8EDF5' }}>{payload[0].value}%</div>
    </div>
  );
}

function OptimisationTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', fontSize: '11px' }}>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: '#8A9BB5' }}>{p.name}:</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#E8EDF5' }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value} kWh</span>
        </div>
      ))}
    </div>
  );
}

// Format timestamp to day label
function fmtTs(ts: string): string {
  const d = new Date(ts);
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  if (d.getHours() === 0) return days[d.getDay()];
  return '';
}

// Expose reset for global R-key
let _act3ResetFn: (() => void) | null = null;
export function resetAct3Screen() { _act3ResetFn?.(); }

export function Act3Screen() {
  const { data, extra } = useData();
  const [expanded, setExpanded] = useState<number | null>(0);
  const [showOptimisation, setShowOptimisation] = useState(false);

  // Animated saving value: counts from 0 to saving_pct over 1.5s
  const [animSaving, setAnimSaving] = useState(0);
  const [animBarWidth, setAnimBarWidth] = useState(0); // 0-100 for progress bar
  const animRef = useRef<number | null>(null);

  const handleShowOptimisation = () => {
    if (showOptimisation) {
      // Hide: reset animation state
      setShowOptimisation(false);
      setAnimSaving(0);
      setAnimBarWidth(0);
      if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
      return;
    }
    setShowOptimisation(true);
    // Trigger animation after a short delay so the panel mounts first
    setTimeout(() => {
      const target = extra?.optimisation?.saving_pct ?? 10.5;
      const dur = 1500;
      const t0 = performance.now();
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const tick = (now: number) => {
        const raw = (now - t0) / dur;
        const t = Math.min(raw, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setAnimSaving(target * eased);
        setAnimBarWidth(eased * 100);
        if (t < 1) { animRef.current = requestAnimationFrame(tick); }
        else { animRef.current = null; }
      };
      animRef.current = requestAnimationFrame(tick);
    }, 80);
  };

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  // Register for global R-key reset
  useEffect(() => {
    _act3ResetFn = () => {
      setShowOptimisation(false);
      setAnimSaving(0);
      setAnimBarWidth(0);
      if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    };
    return () => { _act3ResetFn = null; };
  });

  const attribution = data?.attribution;
  const optimisation = extra?.optimisation;
  if (!data || !attribution) return null;

  const grouped = attribution.grouped_importance;
  const features = attribution.feature_importance_pct;

  const groupedChartData = [
    { name: 'Occupancy', value: grouped.schedule_occupancy, color: '#0EA5E9' },
    { name: 'Weather',   value: grouped.weather,            color: '#F59E0B' },
    { name: 'Feedback',  value: grouped.measured_feedback,  color: '#10B981' },
  ];

  const featureChartData = [
    { name: 'lag_1h',   value: features.lag_1h,   color: '#0EA5E9' },
    { name: 'lag_24h',  value: features.lag_24h,  color: '#0EA5E9' },
    { name: 'lag_168h', value: features.lag_168h, color: '#0EA5E9' },
    { name: 'hour',     value: features.hour,     color: '#F59E0B' },
    { name: 'month',    value: features.month,    color: '#F59E0B' },
    { name: 'airTemp',  value: features.airTemp,  color: '#F59E0B' },
    { name: 'dewTemp',  value: features.dewTemp,  color: '#8A9BB5' },
    { name: 'windSpd',  value: features.windSpeed, color: '#8A9BB5' },
    { name: 'dow',      value: features.dayofweek, color: '#3D4F6A' },
  ].sort((a, b) => b.value - a.value);

  // Build optimisation chart data (sample every 4th hour for clarity)
  const optChartData = optimisation
    ? optimisation.timestamps
        .map((ts, i) => ({
          time: fmtTs(ts),
          baseline: optimisation.baseline_week[i],
          scenario: optimisation.scenario_week[i],
        }))
        .filter((_, i) => i % 2 === 0)
    : [];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0A0E14', overflow: 'hidden' }}>
      {/* Left: Drivers */}
      <div style={{ width: '320px', flexShrink: 0, padding: '16px', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A9BB5', marginBottom: '3px' }}>Most likely drivers (ranked)</div>
          <div style={{ fontSize: '10px', color: '#3D4F6A' }}>AI-assisted · evidence-ranked, not measured causation</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {DRIVERS.map((d, i) => (
            <DriverCard
              key={d.rank}
              driver={d}
              expanded={expanded === i}
              onToggle={() => setExpanded(expanded === i ? null : i)}
            />
          ))}
        </div>

        {/* Key insight callout */}
        <div style={{ borderRadius: '8px', padding: '12px 14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polygon points="7,1 8.8,5.3 13.5,5.3 9.8,8.2 11.2,12.5 7,9.8 2.8,12.5 4.2,8.2 0.5,5.3 5.2,5.3" fill="#F59E0B" opacity="0.9" />
            </svg>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#F59E0B' }}>Key insight</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#E8EDF5', lineHeight: 1.4 }}>
            empty building still uses {data.kpis.baseload_share_pct}% of term load
          </div>
          <div style={{ fontSize: '10px', color: '#8A9BB5', marginTop: '5px' }}>
            Holiday weekday: {attribution.occupancy_evidence.holiday_weekday_mean_kwh} kWh vs term {attribution.occupancy_evidence.term_weekday_mean_kwh} kWh
          </div>
        </div>

        {/* Create optimisation scenario button */}
        <button
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
          onClick={handleShowOptimisation}
        >
          {showOptimisation ? 'Hide scenario' : 'Create optimisation scenario'}
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d={showOptimisation ? 'M3 7h8' : 'M3 7h8M7.5 3.5l3.5 3.5-3.5 3.5'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Right: Charts */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', overflowY: 'auto' }}>

        {/* Optimisation scenario panel — shown when button clicked */}
        {showOptimisation && optimisation && (
          <div
            style={{
              borderRadius: '8px',
              background: '#111827',
              border: '1px solid rgba(245,158,11,0.2)',
              padding: '14px 16px',
              flexShrink: 0,
              animation: 'fadeSlideIn 250ms cubic-bezier(0.23,1,0.32,1)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B', marginBottom: '3px' }}>
                  {optimisation.label}
                </div>
                <div style={{ fontSize: '10px', color: '#8A9BB5' }}>{optimisation.driver}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', fontWeight: 700, color: '#10B981', lineHeight: 1 }}>
                  -{animSaving.toFixed(1)}%
                </div>
                {/* Animated progress bar */}
                <div style={{ width: '80px', height: '4px', borderRadius: '2px', background: 'rgba(16,185,129,0.15)', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    background: 'linear-gradient(to right, #10B981, #34D399)',
                    width: `${animBarWidth}%`,
                    transition: 'none',
                  }} />
                </div>
                <div style={{ fontSize: '9px', color: '#8A9BB5', marginTop: '4px' }}>illustrative annual saving</div>
              </div>
            </div>

            {/* IMPORTANT disclaimer */}
            <div
              style={{
                padding: '7px 10px',
                borderRadius: '5px',
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
                fontSize: '10px',
                color: '#8A9BB5',
                lineHeight: 1.5,
                marginBottom: '10px',
              }}
            >
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>Note: </span>
              {optimisation.assumption}
            </div>

            {/* Comparison chart */}
            <div style={{ height: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={optChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#3D4F6A', fontFamily: 'DM Sans, sans-serif' }} tickLine={false} axisLine={false} interval={11} />
                  <YAxis tick={{ fontSize: 9, fill: '#3D4F6A', fontFamily: 'DM Sans, sans-serif' }} tickLine={false} axisLine={false} width={38} tickCount={4} />
                  <Tooltip content={<OptimisationTooltip />} />
                  <Area dataKey="baseline" fill="rgba(14,165,233,0.06)" stroke="#0EA5E9" strokeWidth={1.5} dot={false} name="Baseline" />
                  <Line dataKey="scenario" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="What-if scenario" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '10px', color: '#8A9BB5' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '16px', height: '2px', background: '#0EA5E9', display: 'inline-block', borderRadius: '1px' }} />
                Baseline (actual)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '16px', borderTop: '2px dashed #10B981', display: 'inline-block' }} />
                What-if scenario
              </span>
            </div>
          </div>
        )}

        {/* Driver importance (grouped) */}
        <div style={{ borderRadius: '8px', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#E8EDF5', marginBottom: '4px' }}>Driver importance (relative)</div>
          <div style={{ fontSize: '10px', color: '#8A9BB5', marginBottom: '10px' }}>Grouped by category · % of model variance explained</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupedChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8A9BB5', fontFamily: 'DM Sans, sans-serif' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#3D4F6A', fontFamily: 'DM Sans, sans-serif' }} tickLine={false} axisLine={false} domain={[0, 70]} width={32} tickCount={4} />
                <Tooltip content={<BarTip />} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {groupedChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature importance detail */}
        <div style={{ borderRadius: '8px', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#E8EDF5', marginBottom: '4px' }}>Driver impact (relative)</div>
          <div style={{ fontSize: '10px', color: '#8A9BB5', marginBottom: '10px' }}>LightGBM feature importance · top 9 features</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureChartData} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#3D4F6A', fontFamily: 'DM Sans, sans-serif' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#8A9BB5', fontFamily: 'JetBrains Mono, monospace' }} tickLine={false} axisLine={false} width={52} />
                <Tooltip content={<BarTip />} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {featureChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy evidence strip */}
        <div style={{ borderRadius: '8px', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', flexShrink: 0 }}>
          <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8A9BB5', marginBottom: '8px' }}>Occupancy evidence</div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#8A9BB5', marginBottom: '2px' }}>Term weekday mean</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '16px', fontWeight: 700, color: '#0EA5E9' }}>{attribution.occupancy_evidence.term_weekday_mean_kwh} kWh</div>
            </div>
            <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
              <path d="M2 8h20M14 2l8 6-8 6" stroke="#3D4F6A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div style={{ fontSize: '10px', color: '#8A9BB5', marginBottom: '2px' }}>Holiday weekday mean</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '16px', fontWeight: 700, color: '#E8EDF5' }}>{attribution.occupancy_evidence.holiday_weekday_mean_kwh} kWh</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#8A9BB5', marginBottom: '2px' }}>Drop when empty</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 700, color: '#F59E0B' }}>{attribution.occupancy_evidence.holiday_drop_pct}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
