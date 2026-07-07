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
          <img
            src="/manus-storage/logo-dtt_896b222e.png"
            alt="Dual-Track Digital Twin"
            width={32}
            height={32}
            style={{ borderRadius: '7px', objectFit: 'cover', display: 'block' }}
          />
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

        {/* Hero image — fills the entire right column */}
        <img
          src="/manus-storage/hero-building_8533cec8.png"
          alt="Building digital twin visualization"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />

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
