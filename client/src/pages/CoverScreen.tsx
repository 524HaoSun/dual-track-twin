import React, { useEffect, useState } from 'react';
import { useNav } from '@/contexts/NavContext';

const CYAN = '#0EA5E9';
const GOLD = '#F59E0B';
const INK = '#E8EDF5';
const MUTED = '#8A9BB5';
const SUBTLE = '#3D4F6A';

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Dual-Track Digital Twin"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="cover-logo-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#092238" />
          <stop offset="100%" stopColor="#03101C" />
        </linearGradient>
        <linearGradient id="cover-logo-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CYAN} />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
      </defs>
      <path d="M15 10 30 5v34l-15 4V10Z" fill="url(#cover-logo-face)" stroke={CYAN} strokeWidth="1.4" />
      <path d="M30 5 38 11v29l-8-1V5Z" fill="#061827" stroke="#075985" strokeWidth="1.2" />
      <path d="M19 14v24M24 12v24M15 19l15-4M15 25l15-4M15 31l15-4M15 37l15-4" stroke="#0EA5E9" strokeOpacity="0.55" strokeWidth="1" />
      <path d="M32 13l4 2M32 19l4 1.8M32 25l4 1.6M32 31l4 1.4" stroke={GOLD} strokeOpacity="0.55" strokeWidth="1" />
      <path d="M13 43h28" stroke="#0B5F88" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15 10 30 5 38 11" fill="none" stroke="url(#cover-logo-edge)" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        minHeight: '38px',
        padding: '8px 15px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.035)',
      }}
    >
      <span style={{ color: CYAN, display: 'inline-flex', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '12px', color: MUTED, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
}

function StepItem({
  icon,
  label,
  desc,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', minWidth: 0 }}>
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '8px',
          background: `${color}12`,
          border: `1px solid ${color}45`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: INK, marginBottom: '4px', lineHeight: 1.15 }}>{label}</div>
        <div style={{ fontSize: '11px', color: MUTED, lineHeight: 1.45 }}>{desc}</div>
      </div>
    </div>
  );
}

function SparklineIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 12c2.2-5.5 4.2-5.6 6-2.3C9.6 12.7 12 8.4 14 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.8V8l2.4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M3 13V6.5L8 3l5 3.5V13" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6.2 13V9.2h3.6V13" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 8h3l1.7-4.2L10 12l1.5-4H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 12c2.4-5.5 4.3-5.6 6.1-2.4C9.8 12.7 12 8 14 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <path d="M11 4h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalibrateIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.45" />
      <path d="M8 2.3v2M8 11.7v2M2.3 8h2M11.7 8h2M4 4l1.4 1.4M10.6 10.6 12 12M4 12l1.4-1.4M10.6 5.4 12 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 10.5 5.2 6.6 8 8.6 11.1 4.6 14 6.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="6.4" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function CoverScreen() {
  const { setScreen } = useNav();
  const [visible, setVisible] = useState(false);
  const heroUrl = `${import.meta.env.BASE_URL}hero-digital-twin-v2.png`;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '47% 53%',
        background: '#07101A',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 22% 44%, rgba(14,165,233,0.075), transparent 50%), linear-gradient(90deg, #07101A 0%, #0A111B 47%, #06101C 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.35,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.035\'/%3E%3C/svg%3E")',
        }}
      />

      <section
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 34px 22px 44px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 650ms ease, transform 650ms cubic-bezier(0.23,1,0.32,1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <BrandMark size={35} />
          <span style={{ fontSize: '14px', fontWeight: 800, color: MUTED, letterSpacing: '0.015em' }}>Dual-Track Digital Twin</span>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 12px',
              borderRadius: '5px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.28)',
              boxShadow: '0 0 22px rgba(16,185,129,0.08)',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 9px #10B981' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981' }}>Live demo</span>
          </div>
        </div>

        <main style={{ transform: 'translateY(-8px)' }}>
          <h1 style={{ fontSize: '44px', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.028em', color: INK, marginBottom: '18px' }}>
            Digital Twin Demo
          </h1>
          <div style={{ fontSize: '15px', fontWeight: 850, color: CYAN, marginBottom: '16px', letterSpacing: '0.005em' }}>
            ZEBAI Research Fellow Interview (BO4-O7355)
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#B9C8DC', marginBottom: '22px' }}>
            Dr Hao Sun <span style={{ color: SUBTLE, padding: '0 8px' }}>&middot;</span> 9 July 2026
          </div>
          <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.62, maxWidth: '430px', marginBottom: '30px' }}>
            Bridging design intent and operational reality, quantifying the performance gap, then explaining why.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setScreen('building')}
              className="btn-primary"
              style={{ fontSize: '15px', fontWeight: 850, padding: '13px 26px', borderRadius: '8px', gap: '12px' }}
            >
              Start interactive demo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h9M8.5 4.2 12.3 8l-3.8 3.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setScreen('flow')}
              className="btn-ghost"
              style={{ fontSize: '14px', fontWeight: 700, padding: '13px 24px', borderRadius: '8px', color: MUTED }}
            >
              How it works
            </button>
          </div>
        </main>

        <footer style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px 12px', maxWidth: '500px' }}>
            <FeaturePill icon={<SparklineIcon />} label="LightGBM model" />
            <FeaturePill icon={<ClockIcon />} label="168-hour scenarios" />
            <FeaturePill icon={<BuildingIcon />} label="81 UK school buildings" />
            <FeaturePill icon={<PulseIcon />} label="ASHRAE G14 validated" />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '22px',
              maxWidth: '520px',
              padding: '18px 18px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.075)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.035)',
            }}
          >
            <StepItem icon={<TrendIcon />} label="Predict" desc="Design assumptions to energy forecast" color={CYAN} />
            <StepItem icon={<CalibrateIcon />} label="Calibrate" desc="Inject measured data, reduce error" color={CYAN} />
            <StepItem icon={<FeedbackIcon />} label="Feed back" desc="Rank drivers, explain the gap" color={GOLD} />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              maxWidth: '520px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '12px',
              fontSize: '11px',
              color: SUBTLE,
            }}
          >
            <span>Dr Hao Sun &middot; ZEBAI</span>
            <span>Building Data Genome Project 2 &middot; LightGBM</span>
          </div>
        </footer>
      </section>

      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          opacity: visible ? 1 : 0,
          transition: 'opacity 900ms ease 250ms',
        }}
      >
        <img
          src={heroUrl}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '3%',
            bottom: '3%',
            left: '50%',
            width: '112%',
            height: '94%',
            objectFit: 'cover',
            objectPosition: 'center center',
            transform: 'translateX(-50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, rgba(7,16,26,0.48) 0%, rgba(7,16,26,0.08) 22%, rgba(7,16,26,0.02) 100%), linear-gradient(180deg, rgba(4,12,22,0.18) 0%, transparent 48%, rgba(4,12,22,0.32) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '1px',
            background: 'linear-gradient(to bottom, transparent, rgba(14,165,233,0.22), transparent)',
          }}
        />
      </section>
    </div>
  );
}
