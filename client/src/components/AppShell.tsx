/**
 * AppShell — Dual-Track Digital Twin
 * finesse-skill product UI | register=product | SPECTACLE=2 | DENSITY=8
 * 16:9 locked stage, dark bg #0A0E14, cyan #0EA5E9, gold #F59E0B
 * DM Sans + JetBrains Mono
 */
import React, { useEffect } from 'react';
import { useNav, type Screen } from '@/contexts/NavContext';
import { useData } from '@/contexts/DataContext';
import { CoverScreen } from '@/pages/CoverScreen';
import { DashboardScreen } from '@/pages/DashboardScreen';
import { Act1Screen } from '@/pages/Act1Screen';
import { Act2Screen } from '@/pages/Act2Screen';
import { LadderScreen } from '@/pages/LadderScreen';
import { FlowScreen } from '@/pages/FlowScreen';
import { Act3Screen } from '@/pages/Act3Screen';
import { BuildingScreen, resetBuildingScreen } from '@/pages/BuildingScreen';
import { resetAct2Screen } from '@/pages/Act2Screen';
import { resetAct3Screen } from '@/pages/Act3Screen';
import { AssistantPanel } from '@/components/AssistantPanel';
import {
  LayoutDashboard,
  TrendingUp,
  Sliders,
  BarChart3,
  GitBranch,
  Activity,
  MessageCircle,
  Building2,
} from 'lucide-react';

// ── Brand mark ────────────────────────────────────────────────────────────────
function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Dual-Track Digital Twin"
      style={{ display: 'block', borderRadius: '6px' }}
    >
      <defs>
        <linearGradient id="brand-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="#0D1420" />
      <rect x="1" y="1" width="46" height="46" rx="9" fill="url(#brand-bg)" stroke="rgba(255,255,255,0.12)" />
      <path d="M12 34V18l10-6 10 6v16" fill="none" stroke="#0EA5E9" strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 34V23h10v11" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinejoin="round" />
      <path d="M12 34h24" stroke="#E8EDF5" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 20h4M16 25h4M28 20h4" stroke="#E8EDF5" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Screen; icon: React.ElementType; label: string; step?: number }[] = [
  { id: 'building',  icon: Building2,       label: 'Building' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
  { id: 'act1',      icon: TrendingUp,      label: 'Predict',   step: 1 },
  { id: 'act2',      icon: Sliders,         label: 'Calibrate', step: 2 },
  { id: 'flow',      icon: GitBranch,       label: 'Flow' },
  { id: 'ladder',    icon: BarChart3,       label: 'Ladder' },
  { id: 'act3',      icon: Activity,        label: 'Feed back', step: 3 },
];

const STEP_SCREENS: Partial<Record<Screen, number>> = { act1: 1, act2: 2, act3: 3 };

// ── Top bar ───────────────────────────────────────────────────────────────────
function TopBar() {
  const { screen, setAssistantOpen, assistantOpen } = useNav();
  const step = STEP_SCREENS[screen];

  const screenLabel: Partial<Record<Screen, string>> = {
    building:  'Building · Luz school',
    dashboard: 'Dual-track overview',
    ladder: 'Calibration ladder',
    flow: 'How the demo flows',
  };

  return (
    <div
      className="absolute top-0 left-12 right-0 h-10 flex items-center px-4 gap-3 z-30"
      style={{
        background: 'rgba(10,14,20,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Breadcrumb / step */}
      {step ? (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium"
            style={{ background: 'rgba(14,165,233,0.12)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)' }}
          >
            <span className="font-mono text-xs">{step}/3</span>
            {step === 1 ? 'Predict' : step === 2 ? 'Calibrate' : 'Feed back'}
          </span>
        </div>
      ) : (
        <span className="text-xs font-medium" style={{ color: '#8A9BB5' }}>
          {screenLabel[screen] ?? ''}
        </span>
      )}

      <div className="flex-1" />

      {/* Status indicators */}
      <div className="flex items-center gap-3">
        <StatusDot label="Twin online" />
        <StatusDot label="Data fresh" />
      </div>

      {/* User chip */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium"
        style={{ background: 'rgba(255,255,255,0.06)', color: '#8A9BB5', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: '#0EA5E9', color: '#0A0E14' }}
        >H</span>
        Demo · Hao Sun
      </div>

      {/* Ask the twin */}
      <button
        onClick={() => setAssistantOpen(!assistantOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all duration-150"
        style={{
          background: assistantOpen ? '#0EA5E9' : 'rgba(14,165,233,0.1)',
          color: assistantOpen ? '#0A0E14' : '#0EA5E9',
          border: '1px solid rgba(14,165,233,0.3)',
        }}
      >
        <MessageCircle size={11} />
        Ask the twin
      </button>
    </div>
  );
}

function StatusDot({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#8A9BB5' }}>
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: '#10B981', boxShadow: '0 0 4px #10B981' }}
      />
      {label}
    </span>
  );
}

// ── Left nav rail ─────────────────────────────────────────────────────────────
function LeftNav() {
  const { screen, setScreen } = useNav();

  return (
    <div
      className="absolute left-0 top-0 bottom-0 w-12 flex flex-col items-center py-2 gap-0.5 z-40"
      style={{
        background: '#0A0E14',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Brand mark */}
      <div className="mb-3 mt-1 flex items-center justify-center w-10 h-10">
        <BrandMark size={24} />
      </div>

      {/* Divider */}
      <div className="w-6 h-px mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Nav items */}
      {NAV_ITEMS.map(({ id, icon: Icon, label, step }) => {
        const active = screen === id;
        return (
          <button
            key={id}
            onClick={() => setScreen(id)}
            title={label}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{
              background: active ? 'rgba(14,165,233,0.15)' : 'transparent',
              color: active ? '#0EA5E9' : 'rgba(255,255,255,0.35)',
            }}
          >
            {React.createElement(Icon as any, { size: 16 })}
            {/* Active left indicator */}
            {active && (
              <span
                className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r"
                style={{ background: '#0EA5E9' }}
              />
            )}

          </button>
        );
      })}
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: '#0A0E14' }}
    >
      <div className="text-center space-y-4">
        <BrandMark size={40} />
        <div className="text-xs font-medium" style={{ color: '#8A9BB5' }}>Loading data…</div>
        <div className="w-24 h-0.5 rounded-full overflow-hidden mx-auto" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full"
            style={{ background: '#0EA5E9', width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Screen router ─────────────────────────────────────────────────────────────
function ScreenContent() {
  const { screen } = useNav();
  switch (screen) {
    case 'building':  return <BuildingScreen />;
    case 'dashboard': return <DashboardScreen />;
    case 'act1':      return <Act1Screen />;
    case 'act2':      return <Act2Screen />;
    case 'flow':      return <FlowScreen />;
    case 'ladder':    return <LadderScreen />;
    case 'act3':      return <Act3Screen />;
    default:          return <DashboardScreen />;
  }
}

// ── Keyboard navigation order ────────────────────────────────────────────────
const SCREEN_ORDER: Screen[] = ['cover', 'building', 'dashboard', 'act1', 'act2', 'ladder', 'act3'];

// ── Root shell ────────────────────────────────────────────────────────────────
export function AppShell() {
  const { screen, setScreen, assistantOpen, setAssistantOpen } = useNav();
  const { loading, error } = useData();

  // ← / → keyboard navigation — skip when assistant is open or user is typing
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      // Don't intercept when modifier keys are held
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const idx = SCREEN_ORDER.indexOf(screen);
        if (idx === -1) return;
        const next = e.key === 'ArrowRight'
          ? SCREEN_ORDER[Math.min(idx + 1, SCREEN_ORDER.length - 1)]
          : SCREEN_ORDER[Math.max(idx - 1, 0)];
        if (next !== screen) setScreen(next);
      }

      // R key: global demo reset
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetAct2Screen();
        resetAct3Screen();
        resetBuildingScreen();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [screen, setScreen]);

  // Cover screen: full stage, no shell chrome
  if (screen === 'cover') {
    return (
      <div className="stage">
        <div className="stage-inner">
          <CoverScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="stage">
      <div className="stage-inner" style={{ background: '#0A0E14' }}>
        {loading ? (
          <LoadingScreen />
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: '#EF4444' }}>
            Failed to load data: {error}
          </div>
        ) : (
          <>
            <LeftNav />
            <TopBar />
            {/* Main content area */}
            <div
              className="absolute left-12 top-10 right-0 bottom-0 overflow-hidden"
              style={{ background: '#0A0E14' }}
            >
              <ScreenContent />
            </div>
            {/* Docked assistant */}
            {assistantOpen && (
              <div className="absolute top-10 right-0 bottom-0" style={{ zIndex: 50 }}>
                <AssistantPanel onClose={() => setAssistantOpen(false)} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
