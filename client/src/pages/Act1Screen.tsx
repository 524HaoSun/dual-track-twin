/**
 * Act1Screen — Design Track (Predict)
 * finesse-skill product UI | dark #0A0E14 | cyan #0EA5E9 | gold #F59E0B
 * Live slider-driven S0 prediction curve
 */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart
} from 'recharts';
import { useData } from '@/contexts/DataContext';
import { RotateCcw } from 'lucide-react';

const DEFAULT_VENTILATION = 1.0;
const DEFAULT_OCCUPANCY   = 1.0;
const DEFAULT_EQUIP_LOAD  = 120;

function formatHour(ts: string): string {
  const d = new Date(ts);
  if (d.getHours() === 0) return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  return '';
}

function scalePrediction(p: number, occ: number, equip: number, vent: number): number {
  const occMult  = occ  / DEFAULT_OCCUPANCY;
  const equipMult = equip / DEFAULT_EQUIP_LOAD;
  const ventMult  = vent  / DEFAULT_VENTILATION;
  return Math.max(0, p * 0.30 + p * 0.45 * occMult + p * 0.20 * equipMult + p * 0.05 * ventMult);
}

function estimateCvrmse(occ: number, equip: number, vent: number): number {
  const occDev   = Math.abs(occ  - DEFAULT_OCCUPANCY)   / DEFAULT_OCCUPANCY;
  const equipDev = Math.abs(equip - DEFAULT_EQUIP_LOAD)  / DEFAULT_EQUIP_LOAD;
  const ventDev  = Math.abs(vent  - DEFAULT_VENTILATION) / DEFAULT_VENTILATION;
  return Math.min(80, 47.6 + (occDev * 0.5 + equipDev * 0.3 + ventDev * 0.2) * 30);
}

function AnimNum({ value, decimals = 1, color }: { value: number; decimals?: number; color?: string }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const start = prev.current, end = value, dur = 400, t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / dur, 1);
      setDisp(start + (end - start) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick); else prev.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span style={color ? { color } : {}}>{disp.toFixed(decimals)}</span>;
}

function formatSliderValue(value: number, unit: string): string {
  if (unit === 'x') return `${value.toFixed(2)}x`;
  if (unit === '%') return `${value.toFixed(0)}%`;
  if (unit === 'ACH') return `${value.toFixed(1)} ${unit}`;
  return `${value.toFixed(value < 10 ? 1 : 0)} ${unit}`;
}

function SliderRow({ emoji, label, value, unit, min, max, step, defaultVal, onChange }: {
  emoji: string; label: string; value: number; unit: string;
  min: number; max: number; step: number; defaultVal: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const changed = Math.abs(value - defaultVal) > step * 0.1;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '14px' }}>{emoji}</span>
          <span style={{ fontSize: '11px', fontWeight: 500, color: '#E8EDF5' }}>{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: changed ? '#F59E0B' : '#0EA5E9' }}>
            {formatSliderValue(value, unit)}
          </span>
          {changed && (
            <button onClick={() => onChange(defaultVal)} style={{ color: '#8A9BB5', padding: '2px' }}>
              <RotateCcw size={10} />
            </button>
          )}
        </div>
      </div>
      <div style={{ position: 'relative', height: '6px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: '3px', background: changed ? '#F59E0B' : '#0EA5E9', transition: 'width 120ms ease' }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'pointer' }} />
      </div>
      <div className="flex justify-between" style={{ fontSize: '9px', color: '#3D4F6A', marginTop: '3px' }}>
        <span>{formatSliderValue(min, unit)}</span>
        <span style={{ color: '#8A9BB5' }}>default {formatSliderValue(defaultVal, unit)}</span>
        <span>{formatSliderValue(max, unit)}</span>
      </div>
    </div>
  );
}

function ChartTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const items = payload.filter((p: any) => ['prediction','baseline'].includes(p.dataKey));
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

export function Act1Screen() {
  const { data } = useData();
  const [ventilation, setVentilation] = useState(DEFAULT_VENTILATION);
  const [occupancy,   setOccupancy]   = useState(DEFAULT_OCCUPANCY);
  const [equipLoad,   setEquipLoad]   = useState(DEFAULT_EQUIP_LOAD);
  const [predicted,   setPredicted]   = useState(true);

  const scenarioData = data?.scenarios.cold_snap;
  const s0 = scenarioData?.stages.S0;

  const isAtDefault = Math.abs(occupancy - DEFAULT_OCCUPANCY) < 0.005 && Math.abs(equipLoad - DEFAULT_EQUIP_LOAD) < 1 && Math.abs(ventilation - DEFAULT_VENTILATION) < 0.05;

  useEffect(() => { if (!isAtDefault) setPredicted(true); }, [ventilation, occupancy, equipLoad, isAtDefault]);

  const chartData = useMemo(() => {
    if (!scenarioData || !s0) return [];
    return scenarioData.timestamps.map((ts, i) => {
      const p = s0.p[i];
      const scaled = scalePrediction(p, occupancy, equipLoad, ventilation);
      const ratio = p > 0 ? scaled / p : 1;
      return { idx: i, ts, time: formatHour(ts), prediction: scaled, baseline: isAtDefault ? undefined : p, lo: s0.lo[i] * ratio, hi: s0.hi[i] * ratio };
    });
  }, [scenarioData, s0, occupancy, equipLoad, ventilation, isAtDefault]);

  const cvrmse = useMemo(() => estimateCvrmse(occupancy, equipLoad, ventilation), [occupancy, equipLoad, ventilation]);
  const totalKwh = useMemo(() => Math.round(chartData.reduce((a, d) => a + d.prediction, 0)), [chartData]);
  const bandPct = useMemo(() => {
    if (!chartData.length) return 84;
    const meanPred = chartData.reduce((a, d) => a + d.prediction, 0) / chartData.length;
    const meanHi = chartData.reduce((a, d) => a + d.hi, 0) / chartData.length;
    return meanPred > 0 ? Math.round(((meanHi - meanPred) / meanPred) * 100) : 84;
  }, [chartData]);

  if (!data || !scenarioData || !s0) return null;

  const predColor = !isAtDefault ? '#F59E0B' : '#0EA5E9';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0A0E14', overflow: 'hidden' }}>
      {/* Left rail */}
      <div style={{ width: '256px', flexShrink: 0, padding: '16px', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A9BB5', marginBottom: '3px' }}>Design assumptions</div>
          <div style={{ fontSize: '11px', color: '#3D4F6A' }}>Adjust to preview predicted energy</div>
        </div>

        <div>
          <SliderRow emoji="💨" label="Ventilation" value={ventilation} unit="ACH" min={0.5} max={3.0} step={0.1} defaultVal={DEFAULT_VENTILATION} onChange={setVentilation} />
          <SliderRow emoji="👥" label="Occupancy schedule" value={occupancy} unit="x" min={0.8} max={1.2} step={0.05} defaultVal={DEFAULT_OCCUPANCY} onChange={setOccupancy} />
          <SliderRow emoji="⚡" label="Equipment load" value={equipLoad} unit="W/m²" min={60} max={200} step={5} defaultVal={DEFAULT_EQUIP_LOAD} onChange={setEquipLoad} />
        </div>

        {!isAtDefault && (
          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#F59E0B', marginBottom: '8px' }}>Active multipliers</div>
            {[
              { label: 'Occupancy',   mult: occupancy / DEFAULT_OCCUPANCY },
              { label: 'Equipment',   mult: equipLoad / DEFAULT_EQUIP_LOAD },
              { label: 'Ventilation', mult: ventilation / DEFAULT_VENTILATION },
            ].map(({ label, mult }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#8A9BB5' }}>{label}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600, color: Math.abs(mult - 1) > 0.05 ? '#F59E0B' : '#8A9BB5' }}>{mult.toFixed(2)}×</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#8A9BB5', marginBottom: '2px' }}>Predicted total (week)</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '18px', fontWeight: 700, color: '#E8EDF5', letterSpacing: '-0.03em' }}>
              <AnimNum value={totalKwh} decimals={0} /> kWh
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#8A9BB5', marginBottom: '2px' }}>Est. CV-RMSE</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', fontWeight: 600, color: '#0EA5E9' }}><AnimNum value={cvrmse} decimals={1} />%</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#8A9BB5', marginBottom: '2px' }}>Band width</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', fontWeight: 600, color: '#8A9BB5' }}>±<AnimNum value={bandPct} decimals={0} />%</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '10px', color: '#3D4F6A' }}>Typology model · 91 UK school buildings</div>

        {!isAtDefault && (
          <button onClick={() => { setVentilation(DEFAULT_VENTILATION); setOccupancy(DEFAULT_OCCUPANCY); setEquipLoad(DEFAULT_EQUIP_LOAD); }}
            className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '11px' }}>
            <RotateCcw size={11} /> Reset all
          </button>
        )}
        {!predicted && (
          <button onClick={() => setPredicted(true)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Predict
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
      </div>

      {/* Right chart area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '16px', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#E8EDF5', marginBottom: '5px' }}>Predicted energy use intensity (kWh/m²)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '10px', color: '#8A9BB5', rowGap: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ display: 'inline-block', width: 14, height: 2, borderRadius: 1, background: predColor, flexShrink: 0 }} />
                {!isAtDefault ? 'Modified' : 'S0 design'}
              </span>
              {!isAtDefault && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ display: 'inline-block', width: 14, flexShrink: 0, borderTop: '1.5px dashed #3D4F6A' }} />
                  Standard
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ display: 'inline-block', width: 12, height: 8, borderRadius: 2, background: 'rgba(14,165,233,0.12)', flexShrink: 0 }} />
                ±{bandPct}% band
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '10px', fontWeight: 600, color: '#F59E0B', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#F59E0B" strokeWidth="1" /><text x="6" y="9" textAnchor="middle" fontSize="7" fill="#F59E0B" fontWeight="700">!</text></svg>
            not yet calibrated
          </div>
        </div>

        {predicted ? (
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="predGradA1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={predColor} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={predColor} stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="bandGradA1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.01" />
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
                <Area dataKey="hi" fill="url(#bandGradA1)" stroke="none" legendType="none" />
                <Area dataKey="lo" fill="#0A0E14" stroke="none" legendType="none" />
                {!isAtDefault && <Line dataKey="baseline" stroke="#3D4F6A" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Standard assumptions" />}
                <Area dataKey="prediction" fill="url(#predGradA1)" stroke={predColor} strokeWidth={2} dot={false} name={!isAtDefault ? 'Modified prediction' : 'S0 prediction'} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📐</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#E8EDF5', marginBottom: '4px' }}>Adjust assumptions and click Predict</div>
              <div style={{ fontSize: '11px', color: '#8A9BB5' }}>or move any slider to auto-preview</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px 14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div><span style={{ fontSize: '10px', color: '#8A9BB5' }}>Scenario: </span><span style={{ fontSize: '10px', fontWeight: 500, color: '#E8EDF5' }}>Cold snap week</span></div>
            <div><span style={{ fontSize: '10px', color: '#8A9BB5' }}>Stage: </span><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 600, color: '#0EA5E9' }}>S0</span><span style={{ fontSize: '10px', color: '#8A9BB5' }}> · design assumptions only</span></div>
          </div>
          <div style={{ fontSize: '10px', color: '#3D4F6A' }}>Next: inject measured data to calibrate</div>
        </div>
      </div>
    </div>
  );
}
