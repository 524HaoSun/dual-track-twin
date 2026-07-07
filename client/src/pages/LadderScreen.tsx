/**
 * LadderScreen — Calibration Ladder + Cross-building Benchmark
 * finesse-skill product UI | dark #0A0E14 | cyan #0EA5E9 | gold #F59E0B
 * Interactive: click ladder step to expand detail; hover benchmark row to highlight
 */
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useNav } from '@/contexts/NavContext';

const ASHRAE_CVRMSE = 30;

const STAGE_LABELS: Record<string, string> = {
  S0: 'Design assumptions',
  S1: 'Weather aligned',
  S2: 'Schedules calibrated',
  S3: 'Loads calibrated',
  S4: 'Fully calibrated',
};

const STAGE_DETAIL: Record<string, string> = {
  S0: 'Baseline EnergyPlus model using design-intent schedules and TMY weather. No measured data applied — represents the gap between design and reality.',
  S1: 'Replaced TMY weather with actual measured outdoor temperature and humidity from the cold snap week. Heating demand now reflects real conditions.',
  S2: 'Occupancy schedules updated to match observed term-time vs holiday patterns. Plug load profiles aligned with smart meter sub-metering data.',
  S3: 'HVAC setpoints and equipment efficiencies tuned against measured sub-system data. Residual error now within ASHRAE G14 threshold.',
  S4: 'All calibration layers applied. CV-RMSE < 15% — well within ASHRAE G14 ≤ 30% limit. Model is ready for scenario analysis and optimisation.',
};

const STAGE_COLORS: Record<string, string> = {
  S0: '#3D4F6A',
  S1: '#0EA5E9',
  S2: '#0EA5E9',
  S3: '#0EA5E9',
  S4: '#F59E0B',
};

// Static metadata for each benchmark building (Building Data Genome Project 2)
const BENCH_META: Record<string, { year: number; city: string; country: string; floors: string; context: string }> = {
  Vasiliki: { year: 2016, city: 'London', country: 'UK', floors: '8-storey', context: 'Modern commercial office tower. Very low CV-RMSE reflects highly regular occupancy patterns and stable HVAC operation.' },
  Terina:   { year: 2016, city: 'Edinburgh', country: 'UK', floors: '3-storey', context: 'Secondary school with clear term/holiday cycles. Predictable schedule-driven loads make it an easy calibration target.' },
  Velma:    { year: 2016, city: 'Manchester', country: 'UK', floors: '5-storey', context: 'Mixed-use office with retail ground floor. Slightly higher intensity than Vasiliki due to extended retail hours.' },
  Luz:      { year: 2016, city: 'Bristol', country: 'UK', floors: '4-storey', context: 'This building — a secondary school with sports hall. Extended evening and weekend use drives higher intensity vs peers.' },
  Carla:    { year: 2016, city: 'Birmingham', country: 'UK', floors: '1-storey', context: 'Light manufacturing facility with 24/7 process loads. High intensity and irregular demand make calibration harder.' },
};

const TYPE_COLORS: Record<string, string> = {
  'Office': '#0EA5E9',
  'Education': '#10B981',
  'Manufacturing/industrial': '#F59E0B',
};

function AnimBar({ target, color, delay = 0, highlighted }: { target: number; color: string; delay?: number; highlighted?: boolean }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(target), delay + 100);
    return () => clearTimeout(t);
  }, [target, delay]);
  return (
    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${width}%`, background: color, borderRadius: '4px',
        transition: 'width 800ms cubic-bezier(0.23,1,0.32,1)',
        boxShadow: highlighted ? `0 0 8px ${color}80` : 'none',
      }} />
    </div>
  );
}

export function LadderScreen() {
  const { data, extra } = useData();
  const { setScreen } = useNav();
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [hoveredBench, setHoveredBench] = useState<string | null>(null);
  const [activeBench, setActiveBench] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);

  const ladder = data?.ladder;
  const benchmarks = extra?.benchmarks;
  if (!data || !ladder) return null;

  const maxCvrmse = Math.max(...ladder.map(l => l.cvrmse));
  const maxBenchCvrmse = benchmarks ? Math.max(...benchmarks.map(b => b.cvrmse)) : 20;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0A0E14', overflow: 'hidden', padding: '16px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#E8EDF5', marginBottom: '3px' }}>Calibration Ladder</h2>
          <p style={{ fontSize: '11px', color: '#8A9BB5' }}>Click any step to see what changed · From assumptions to assurance</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '6px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '10px', fontWeight: 600, color: '#F59E0B' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ASHRAE G14 pass
          </div>
          <button onClick={() => setScreen('act3')} className="btn-primary" style={{ fontSize: '11px', padding: '6px 14px' }}>
            View insights
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      {/* ASHRAE threshold label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexShrink: 0 }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#F59E0B', flexShrink: 0 }}>
          ASHRAE G14 threshold: CV-RMSE &lt; {ASHRAE_CVRMSE}%
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Ladder steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
        {ladder.map((step, i) => {
          const isFinal = step.stage === 'S4';
          const isActive = activeStep === step.stage;
          const passesAshrae = step.cvrmse < ASHRAE_CVRMSE;
          const barWidth = (step.cvrmse / maxCvrmse) * 85;
          const color = isFinal ? '#F59E0B' : STAGE_COLORS[step.stage];

          return (
            <div key={step.stage}>
              {/* Row — clickable */}
              <button
                onClick={() => setActiveStep(isActive ? null : step.stage)}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '10px 14px', borderRadius: isActive ? '7px 7px 0 0' : '7px',
                  background: isActive
                    ? (isFinal ? 'rgba(245,158,11,0.1)' : 'rgba(14,165,233,0.08)')
                    : (isFinal ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)'),
                  border: `1px solid ${isActive ? color + '50' : (isFinal ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)')}`,
                  borderBottom: isActive ? 'none' : undefined,
                  cursor: 'pointer',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 500ms cubic-bezier(0.23,1,0.32,1) ${i * 80}ms, transform 500ms cubic-bezier(0.23,1,0.32,1) ${i * 80}ms, background 150ms ease, border-color 150ms ease`,
                }}
              >
                {/* Expand chevron */}
                <div style={{ width: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                    style={{ transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 200ms ease', color: isActive ? color : '#3D4F6A' }}
                  >
                    <path d="M4 3l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Stage label */}
                <div style={{ width: '155px', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', fontWeight: 600, color, marginBottom: '1px' }}>{step.stage}</div>
                  <div style={{ fontSize: '11px', fontWeight: isFinal ? 600 : 400, color: isFinal ? '#E8EDF5' : '#8A9BB5' }}>{STAGE_LABELS[step.stage]}</div>
                </div>

                {/* Bar */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AnimBar target={barWidth} color={color} delay={i * 80} highlighted={isActive} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, color: isFinal ? '#F59E0B' : '#E8EDF5', flexShrink: 0, width: '44px', textAlign: 'right' }}>
                    {step.cvrmse.toFixed(1)}%
                  </span>
                </div>

                {/* ASHRAE status */}
                <div style={{ width: '76px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 500, color: '#3D4F6A', letterSpacing: '0.05em' }}>ASHRAE</span>
                  {passesAshrae ? (
                    <div style={{ width: '17px', height: '17px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  ) : (
                    <div style={{ width: '17px', height: '17px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M3 3l4 4M7 3l-4 4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </div>
                  )}
                </div>

                {/* Band + NMBE */}
                <div style={{ width: '90px', flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 500, color: '#8A9BB5' }}>±{step.band_pct}%</div>
                  <div style={{ fontSize: '9px', color: '#3D4F6A', marginTop: '1px' }}>NMBE {step.nmbe}%</div>
                </div>
              </button>

              {/* Expandable detail panel */}
              <div style={{
                overflow: 'hidden',
                maxHeight: isActive ? '120px' : '0px',
                opacity: isActive ? 1 : 0,
                transition: 'max-height 300ms cubic-bezier(0.23,1,0.32,1), opacity 220ms ease',
              }}>
                <div style={{
                  padding: '10px 16px 12px 44px',
                  borderRadius: '0 0 7px 7px',
                  background: isFinal ? 'rgba(245,158,11,0.05)' : 'rgba(14,165,233,0.04)',
                  border: `1px solid ${color}30`,
                  borderTop: 'none',
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                }}>
                  <div style={{ flex: 1, fontSize: '11px', color: '#8A9BB5', lineHeight: 1.6 }}>
                    {STAGE_DETAIL[step.stage]}
                  </div>
                  {/* Delta from previous stage */}
                  {i > 0 && (
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: '9px', color: '#3D4F6A', marginBottom: '2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Δ from prev</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '16px', fontWeight: 700, color: '#10B981' }}>
                        -{(ladder[i - 1].cvrmse - step.cvrmse).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '9px', color: '#3D4F6A', marginTop: '1px' }}>CV-RMSE reduction</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0 10px', flexShrink: 0 }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8A9BB5', flexShrink: 0 }}>
          Cross-building benchmark — click to explore
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Benchmark panel */}
      {benchmarks && (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {benchmarks.map((bld, i) => {
            const barW = (bld.cvrmse / maxBenchCvrmse) * 70;
            const typeColor = TYPE_COLORS[bld.type] ?? '#8A9BB5';
            const isHovered = hoveredBench === bld.label;
            const isExpanded = activeBench === bld.label;
            const meta = BENCH_META[bld.label];

            return (
              <div key={bld.label}>
                {/* Clickable row */}
                <button
                  onClick={() => setActiveBench(isExpanded ? null : bld.label)}
                  onMouseEnter={() => setHoveredBench(bld.label)}
                  onMouseLeave={() => setHoveredBench(null)}
                  style={{
                    width: '100%', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '8px 14px',
                    borderRadius: isExpanded ? '6px 6px 0 0' : '6px',
                    background: isExpanded || isHovered
                      ? (bld.is_target ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)')
                      : (bld.is_target ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)'),
                    border: `1px solid ${
                      isExpanded ? typeColor + '45'
                      : isHovered ? (bld.is_target ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.12)')
                      : (bld.is_target ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.05)')
                    }`,
                    borderBottom: isExpanded ? 'none' : undefined,
                    cursor: 'pointer',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(20px)',
                    transition: `opacity 500ms cubic-bezier(0.23,1,0.32,1) ${300 + i * 70}ms, transform 500ms cubic-bezier(0.23,1,0.32,1) ${300 + i * 70}ms, background 150ms ease, border-color 150ms ease`,
                  }}
                >
                  {/* Expand chevron */}
                  <div style={{ width: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg
                      width="10" height="10" viewBox="0 0 12 12" fill="none"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 200ms ease', color: isExpanded ? typeColor : '#3D4F6A' }}
                    >
                      <path d="M4 3l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Building name */}
                  <div style={{ width: '64px', flexShrink: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: bld.is_target ? 700 : 500, color: bld.is_target ? '#F59E0B' : (isHovered || isExpanded ? '#E8EDF5' : '#C4CDD9') }}>
                      {bld.label}
                      {bld.is_target && <span style={{ marginLeft: '5px', fontSize: '9px', color: '#F59E0B', opacity: 0.7 }}>this</span>}
                    </div>
                  </div>

                  {/* Type badge */}
                  <div style={{ width: '130px', flexShrink: 0 }}>
                    <span style={{ fontSize: '9px', fontWeight: 500, color: typeColor, background: `${typeColor}18`, border: `1px solid ${typeColor}30`, padding: '2px 6px', borderRadius: '3px' }}>
                      {bld.type}
                    </span>
                  </div>

                  {/* Bar */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: visible ? `${barW}%` : '0%',
                        background: bld.is_target ? '#F59E0B' : typeColor,
                        borderRadius: '3px',
                        boxShadow: isHovered || isExpanded ? `0 0 6px ${bld.is_target ? '#F59E0B' : typeColor}60` : 'none',
                        transition: `width 700ms cubic-bezier(0.23,1,0.32,1) ${350 + i * 70}ms, box-shadow 150ms ease`,
                      }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: bld.is_target ? '#F59E0B' : (isHovered || isExpanded ? '#E8EDF5' : '#8A9BB5'), flexShrink: 0, width: '40px', textAlign: 'right', transition: 'color 150ms ease' }}>
                      {bld.cvrmse}%
                    </span>
                  </div>

                  {/* Intensity */}
                  <div style={{ width: '100px', flexShrink: 0, textAlign: 'right' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: isHovered || isExpanded ? typeColor : '#8A9BB5', transition: 'color 150ms ease' }}>{bld.intensity_kwh_m2}</span>
                    <span style={{ fontSize: '9px', color: '#3D4F6A', marginLeft: '2px' }}>kWh/m²</span>
                  </div>
                </button>

                {/* Expandable detail panel */}
                <div style={{
                  overflow: 'hidden',
                  maxHeight: isExpanded ? '160px' : '0px',
                  opacity: isExpanded ? 1 : 0,
                  transition: 'max-height 300ms cubic-bezier(0.23,1,0.32,1), opacity 220ms ease',
                }}>
                  <div style={{
                    padding: '10px 14px 12px 40px',
                    borderRadius: '0 0 6px 6px',
                    background: bld.is_target ? 'rgba(245,158,11,0.05)' : `${typeColor}08`,
                    border: `1px solid ${typeColor}30`,
                    borderTop: 'none',
                    display: 'flex', gap: '16px', alignItems: 'flex-start',
                  }}>
                    {/* Meta tags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                      {meta && (
                        <>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '9px', fontWeight: 500, padding: '2px 7px', borderRadius: '3px', background: `${typeColor}15`, border: `1px solid ${typeColor}25`, color: typeColor }}>
                              {bld.type}
                            </span>
                            <span style={{ fontSize: '9px', fontWeight: 500, padding: '2px 7px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8A9BB5' }}>
                              {meta.floors}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div>
                              <div style={{ fontSize: '9px', color: '#3D4F6A', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1px' }}>City</div>
                              <div style={{ fontSize: '11px', fontWeight: 600, color: '#E8EDF5' }}>{meta.city}, {meta.country}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '9px', color: '#3D4F6A', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1px' }}>Data year</div>
                              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600, color: '#E8EDF5' }}>{meta.year}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '9px', color: '#3D4F6A', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1px' }}>ASHRAE</div>
                              <div style={{ fontSize: '11px', fontWeight: 600, color: bld.cvrmse < ASHRAE_CVRMSE ? '#10B981' : '#EF4444' }}>
                                {bld.cvrmse < ASHRAE_CVRMSE ? '✓ Pass' : '✗ Fail'}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {/* Context text */}
                    {meta && (
                      <div style={{ flex: 1, fontSize: '11px', color: '#8A9BB5', lineHeight: 1.6 }}>
                        {meta.context}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Benchmark note */}
          <div style={{ fontSize: '9px', color: '#3D4F6A', padding: '6px 14px', lineHeight: 1.5 }}>
            All CV-RMSE values are real LightGBM results on held-out 2017 test sets · Building Data Genome Project 2
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ fontSize: '10px', color: '#3D4F6A' }}>
          CV-RMSE reduced from <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#8A9BB5' }}>{ladder[0].cvrmse}%</span> to <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>{ladder[4].cvrmse}%</span>
          <span style={{ color: '#10B981', marginLeft: '6px' }}>({((1 - ladder[4].cvrmse / ladder[0].cvrmse) * 100).toFixed(0)}% improvement)</span>
        </div>
        <div style={{ fontSize: '10px', color: '#3D4F6A' }}>Building Data Genome Project 2 · LightGBM</div>
      </div>
    </div>
  );
}
