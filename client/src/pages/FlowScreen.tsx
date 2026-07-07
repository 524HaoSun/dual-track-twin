/**
 * FlowScreen — "How the demo flows" storyboard
 * Dark product UI | finesse-skill | 3 steps perfectly aligned
 */
import React, { useEffect, useState } from 'react';
import { useNav } from '@/contexts/NavContext';

const STEPS = [
  {
    num: 1,
    screen: 'act1' as const,
    color: '#0EA5E9',
    title: 'Predict',
    desc: 'Start from design assumptions to predict energy use.',
    detail: 'Use a typology model from 81 UK school buildings. Adjust ventilation, occupancy, and equipment load assumptions. See the wide prediction band — this is the honest uncertainty of design-stage estimates.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 16 Q6 8 9 11 Q12 14 15 7 Q17 3 19 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <circle cx="19" cy="5" r="2" fill="currentColor" opacity="0.7"/>
      </svg>
    ),
  },
  {
    num: 2,
    screen: 'act2' as const,
    color: '#F59E0B',
    title: 'Calibrate',
    desc: 'Inject measured data to calibrate and reduce uncertainty.',
    detail: 'Step through 5 calibration stages (S0 to S4). Watch the model error fall as more measured data is injected. The prediction band narrows. Only the final stage passes ASHRAE Guideline 14.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11h14M11 4v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    num: 3,
    screen: 'act3' as const,
    color: '#10B981',
    title: 'Feed back',
    desc: 'Analyse drivers and feed insight back to improve performance.',
    detail: 'Identify the most likely drivers of the performance gap. Occupant behaviour, weather, and equipment loads explain the gap. The key insight: an empty building still uses more than half of term-time load.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M18 8 C18 5 15 3 11 3 C7 3 4 5.5 4 9 C4 12 6 14 9 15 L9 19 L13 15 C16 14.5 18 12 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <circle cx="11" cy="9" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
];

export function FlowScreen() {
  const { setScreen } = useNav();
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 48px',
      background: 'transparent',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center', marginBottom: '32px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
      }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#E8EDF5', letterSpacing: '-0.03em', marginBottom: '8px' }}>
          How the demo flows
        </h2>
        <p style={{ fontSize: '13px', color: '#8A9BB5', lineHeight: 1.6 }}>
          Three acts, one narrative: from design assumptions to operational insight.
        </p>
      </div>

      {/* 3-column step grid — strictly equal columns, all items top-aligned */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 48px 1fr 48px 1fr',
        alignItems: 'start',
        width: '100%',
        maxWidth: '900px',
        gap: 0,
      }}>
        {STEPS.map((step, i) => {
          const isActive = activeStep === step.num;
          return (
            <React.Fragment key={step.num}>
              {/* Step card */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s cubic-bezier(0.23,1,0.32,1) ${i * 120}ms`,
              }}>
                {/* Icon circle */}
                <button
                  onClick={() => setActiveStep(isActive ? null : step.num)}
                  style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: isActive ? step.color : `${step.color}14`,
                    border: `2px solid ${step.color}`,
                    color: isActive ? '#0A0E14' : step.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', marginBottom: '0',
                    transition: 'all 0.2s cubic-bezier(0.23,1,0.32,1)',
                    transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: isActive ? `0 0 20px ${step.color}40` : 'none',
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </button>

                {/* Step number badge — fixed height spacer so all titles align */}
                <div style={{ height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: step.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 700, color: '#0A0E14' }}>{step.num}</span>
                  </div>
                </div>

                {/* Title — all at same vertical position */}
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#E8EDF5', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  {step.title}
                </h3>

                {/* Description — fixed min-height so detail cards start at same position */}
                <p style={{ fontSize: '12px', color: '#8A9BB5', lineHeight: 1.6, marginBottom: '12px', minHeight: '48px', maxWidth: '220px' }}>
                  {step.desc}
                </p>

                {/* Expanded detail — max-height transition for smooth open/close */}
                <div style={{
                  overflow: 'hidden',
                  maxHeight: isActive ? '200px' : '0px',
                  opacity: isActive ? 1 : 0,
                  marginBottom: isActive ? '12px' : '0px',
                  transition: 'max-height 320ms cubic-bezier(0.23,1,0.32,1), opacity 250ms ease, margin-bottom 320ms ease',
                }}>
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: `${step.color}08`,
                    border: `1px solid ${step.color}25`,
                    fontSize: '11px', color: '#8A9BB5', lineHeight: 1.6,
                    textAlign: 'left', maxWidth: '220px',
                  }}>
                    {step.detail}
                  </div>
                </div>

                {/* CTA button */}
                <button
                  onClick={() => setScreen(step.screen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px', borderRadius: '6px',
                    background: step.color, color: '#0A0E14',
                    fontSize: '11px', fontWeight: 600,
                    cursor: 'pointer', border: 'none',
                    transition: 'all 0.15s ease',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Go to step {step.num}
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Arrow connector — vertically centred on the icon circle (60px tall, offset ~30px from top) */}
              {i < STEPS.length - 1 && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                  paddingTop: '18px', // align with centre of 60px icon
                  opacity: visible ? 1 : 0,
                  transition: `opacity 0.5s ease ${(i + 1) * 120}ms`,
                }}>
                  <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                    <path d="M4 12 H28" stroke="rgba(14,165,233,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M24 8l4 4-4 4" stroke="rgba(14,165,233,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%', maxWidth: '900px', marginTop: '28px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease 0.5s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {STEPS.map((step, i) => (
            <React.Fragment key={step.num}>
              <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: `${step.color}20`, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  background: step.color,
                  width: visible ? '100%' : '0%',
                  transition: `width 0.8s ease ${i * 200 + 500}ms`,
                }} />
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#3D4F6A' }}>
          <span>Design stage</span>
          <span>Calibrated model</span>
          <span>Operational insight</span>
        </div>
      </div>

      {/* Caption */}
      <p style={{ marginTop: '16px', fontSize: '10px', color: '#3D4F6A', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.7s' }}>
        Click each step to expand details · Click "Go to step" to navigate
      </p>
    </div>
  );
}
