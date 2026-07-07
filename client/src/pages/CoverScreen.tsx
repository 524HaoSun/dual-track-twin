/**
 * CoverScreen — Dual-Track Digital Twin
 * finesse-skill product UI | dark #0A0E14 | cyan #0EA5E9 | gold #F59E0B
 * Right: AI-generated hero image (no numbers/labels in illustration)
 * Bottom: App-style feature strip (no metric numbers)
 */
import React, { useEffect, useState } from 'react';
import { useNav } from '@/contexts/NavContext';

// ── Feature pill ──────────────────────────────────────────────────────────────
function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 14px', borderRadius: '8px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <span style={{ color: '#0EA5E9', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '11px', color: '#8A9BB5', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ── Step row ──────────────────────────────────────────────────────────────────
function StepRow({ icon, label, desc, color }: { icon: React.ReactNode; label: string; desc: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <div style={{
        width: '26px', height: '26px', borderRadius: '7px',
        background: `${color}15`, border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
        color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#E8EDF5', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '10px', color: '#8A9BB5', lineHeight: 1.45 }}>{desc}</div>
      </div>
    </div>
  );
}

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Dual-Track Digital Twin" style={{ display: 'block' }}>
      <rect width="48" height="48" rx="10" fill="#0D1420" />
      <rect x="1" y="1" width="46" height="46" rx="9" fill="rgba(14,165,233,0.12)" stroke="rgba(255,255,255,0.12)" />
      <path d="M12 34V18l10-6 10 6v16" fill="none" stroke="#0EA5E9" strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 34V23h10v11" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinejoin="round" />
      <path d="M12 34h24" stroke="#E8EDF5" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 20h4M16 25h4M28 20h4" stroke="#E8EDF5" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

function HeroTwinVisual() {
  const bars = [62, 78, 54, 86, 70, 96, 58, 82, 64, 90, 74, 68];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'radial-gradient(circle at 56% 46%, rgba(14,165,233,0.16), transparent 32%), linear-gradient(135deg, #08111C 0%, #101827 50%, #071019 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)', backgroundSize: '42px 42px', opacity: 0.38 }} />
      <svg viewBox="0 0 900 720" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="tower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60758E" />
            <stop offset="100%" stopColor="#263241" />
          </linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#BCEBFF" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.18" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M130 548 C250 490 410 498 548 532 C656 558 760 560 850 532 L850 720 L130 720 Z" fill="#09131E" opacity="0.86" />
        <path d="M210 526 L210 250 L386 172 L592 262 L592 526 Z" fill="url(#tower)" stroke="#7F91A8" strokeOpacity="0.48" strokeWidth="2" />
        <path d="M386 172 L386 526" stroke="#96A8BC" strokeOpacity="0.34" strokeWidth="2" />
        <path d="M210 250 L386 334 L592 262" fill="none" stroke="#9BB0C7" strokeOpacity="0.28" strokeWidth="2" />
        {Array.from({ length: 7 }, (_, row) =>
          Array.from({ length: 6 }, (_, col) => (
            <rect
              key={`w-${row}-${col}`}
              x={244 + col * 48}
              y={282 + row * 30}
              width="24"
              height="14"
              rx="2"
              fill={col % 3 === 1 ? '#F59E0B' : 'url(#glass)'}
              opacity={col % 3 === 1 ? 0.72 : 0.58}
            />
          ))
        )}
        <path d="M118 510 C210 408 312 446 394 374 C492 286 588 340 706 248" fill="none" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round" filter="url(#glow)" />
        <path d="M118 558 C228 516 310 552 424 492 C548 426 624 446 762 374" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 12" opacity="0.84" />
        {bars.map((h, i) => (
          <rect key={`b-${i}`} x={650 + i * 17} y={520 - h} width="8" height={h} rx="4" fill={i % 3 === 0 ? '#F59E0B' : '#0EA5E9'} opacity="0.72" />
        ))}
        {[
          [156, 510], [286, 422], [394, 374], [540, 316], [706, 248], [762, 374],
        ].map(([x, y], i) => (
          <g key={`n-${i}`} filter="url(#glow)">
            <circle cx={x} cy={y} r="8" fill={i % 2 ? '#F59E0B' : '#0EA5E9'} />
            <circle cx={x} cy={y} r="18" fill="none" stroke={i % 2 ? '#F59E0B' : '#0EA5E9'} strokeOpacity="0.28" strokeWidth="2" />
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', right: '9%', top: '15%', width: '210px', padding: '14px 16px', borderRadius: '10px', background: 'rgba(13,20,32,0.72)', border: '1px solid rgba(14,165,233,0.18)', boxShadow: '0 18px 70px rgba(0,0,0,0.36)', backdropFilter: 'blur(14px)' }}>
        <div style={{ fontSize: '10px', color: '#0EA5E9', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Digital twin live</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '20px', color: '#E8EDF5', fontWeight: 800 }}>8.3%</div>
            <div style={{ fontSize: '9px', color: '#8A9BB5' }}>CV-RMSE</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', color: '#F59E0B', fontWeight: 800 }}>42%</div>
            <div style={{ fontSize: '9px', color: '#8A9BB5' }}>gap</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CoverScreen ───────────────────────────────────────────────────────────────
export function CoverScreen() {
  const { setScreen } = useNav();
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#0A0E14',
      position: 'relative', overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>
      {/* Background glows */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '70%', height: '140%', background: 'radial-gradient(ellipse at 30% 50%, rgba(14,165,233,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', right: '-5%', width: '40%', height: '60%', background: 'radial-gradient(ellipse at 70% 40%, rgba(245,158,11,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
      {/* Grain */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")', pointerEvents: 'none', opacity: 0.4 }} />

      {/* ── Left column ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '20px 36px 18px 48px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.23,1,0.32,1)',
      }}>
        {/* Brand bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrandMark size={32} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#8A9BB5', letterSpacing: '0.02em' }}>Dual-Track Digital Twin</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 4px #10B981', display: 'inline-block' }} />
            <span style={{ fontSize: '9px', fontWeight: 500, color: '#10B981' }}>Live demo</span>
          </div>
        </div>

        {/* Headline + CTA */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0EA5E9', marginBottom: '10px' }}>
            Building Energy Intelligence
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.035em', color: '#E8EDF5', marginBottom: '14px' }}>
            Bridge design<br />
            <span style={{ color: '#0EA5E9' }}>intent</span> and<br />
            operational reality.
          </h1>
          <p style={{ fontSize: '13px', color: '#8A9BB5', lineHeight: 1.65, marginBottom: '22px', maxWidth: '360px' }}>
            A calibrated energy model that quantifies the gap between what was designed and what is measured. Then explains why.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setScreen('building')}
              className="btn-primary"
              style={{ fontSize: '13px', padding: '10px 22px' }}
            >
              Start interactive demo
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7.5 3.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button onClick={() => setScreen('flow')} className="btn-ghost" style={{ fontSize: '12px' }}>
              How it works
            </button>
          </div>
        </div>

        {/* Bottom: 3-step list + credits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Feature pills row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <FeaturePill
              icon={<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 12 Q5 4 8 8 Q11 12 14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>}
              label="LightGBM model"
            />
            <FeaturePill
              icon={<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
              label="168-hour scenarios"
            />
            <FeaturePill
              icon={<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 13 L3 6 L8 3 L13 6 L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="6" y="9" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2"/></svg>}
              label="81 UK school buildings"
            />
            <FeaturePill
              icon={<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 8h3l2-5 3 10 2-5 2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              label="ASHRAE G14 validated"
            />
          </div>

          {/* 3-step list */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <StepRow
              icon={
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M2 12 Q5 4 8 7 Q11 10 14 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                  <path d="M11 3h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              label="Predict"
              desc="Design assumptions to energy forecast"
              color="#0EA5E9"
            />
            <StepRow
              icon={
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M4.1 4.1l1.4 1.4M10.5 10.5l1.4 1.4M4.1 11.9l1.4-1.4M10.5 5.5l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              }
              label="Calibrate"
              desc="Inject measured data, reduce error"
              color="#0EA5E9"
            />
            <StepRow
              icon={
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M2 10 L5 6 L8 8 L11 4 L14 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="14" cy="6" r="1.5" fill="currentColor"/>
                </svg>
              }
              label="Feed back"
              desc="Rank drivers, explain the gap"
              color="#F59E0B"
            />
          </div>

          {/* Credits */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#3D4F6A', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
            <span>Dr Hao Sun · ZEBAI</span>
            <span>Building Data Genome Project 2 · LightGBM</span>
          </div>
        </div>
      </div>

      {/* ── Right column: AI hero image ──────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1s ease 0.4s',
      }}>
        {/* Vertical divider */}
        <div style={{ position: 'absolute', left: 0, top: '8%', bottom: '8%', width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(14,165,233,0.12), transparent)', zIndex: 2 }} />

        <HeroTwinVisual />

        {/* Subtle left-edge fade to blend with divider */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(10,14,20,0.55) 0%, transparent 30%)',
          pointerEvents: 'none',
        }} />

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%',
          background: 'linear-gradient(to top, rgba(10,14,20,0.7) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}
