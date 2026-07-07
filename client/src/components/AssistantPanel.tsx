/**
 * AssistantPanel — Ask the Twin
 * finesse-skill product UI | dark #0A0E14 | cyan #0EA5E9 | gold #F59E0B
 * Live mode: MiMo v2 via OpenRouter (server proxy), 3s timeout → scripted fallback
 */
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { trpc } from '@/lib/trpc';
import { X, Send, Zap, ZapOff } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  tag?: string;
  source?: 'scripted' | 'live' | 'fallback';
}

const SCRIPTED: Record<string, { answer: string; tag?: string }> = {
  'Why is energy higher than designed?': {
    answer: 'The twin suggests the main drivers are extended occupancy and higher plug loads, with colder weather also contributing. Term-time weekday mean is 110.5 kWh vs holiday mean of 59.6 kWh — a 46% drop when the building is empty, pointing to occupant behaviour as the primary cause.',
    tag: 'most likely',
  },
  'How accurate is the model?': {
    answer: 'After full calibration (S4), CV-RMSE is 8.3% and NMBE is 0.3% — both well within ASHRAE Guideline 14 thresholds (CV-RMSE < 30%, NMBE < 10%). The 80% prediction band is ±13%. Starting from design assumptions (S0), CV-RMSE was 47.6% — calibration reduced error by 83%.',
    tag: 'verified',
  },
  'What is the baseload?': {
    answer: 'The building uses 54% of its term-time load even when empty (holiday periods). This persistent baseload — approximately 59.6 kWh on holiday weekdays — likely represents always-on systems: server rooms, refrigeration, security, and standby HVAC. Reducing this is the highest-leverage optimisation opportunity.',
    tag: 'key finding',
  },
  'What drove the cold snap gap?': {
    answer: 'During the cold snap week (avg 3.3°C), the performance gap was 47% — higher than the annual average of 42%. Weather variables (airTemp: 6.9%, dewTemp: 6.3%, windSpeed: 6.2%) are model feature-importance shares, not causal shares of the gap. The ranked conclusion is that occupant behaviour and schedules are most likely the primary drivers; weather is most likely secondary, amplifying the gap during colder-than-typical periods.',
    tag: 'weather',
  },
};

const SUGGESTED = Object.keys(SCRIPTED);

const FALLBACK_ANSWER = `The twin doesn't have a scripted answer for that yet. Based on the calibrated model (CV-RMSE 8.3%), feature-importance shares (model feature-importance shares, not causal shares of the gap) rank as: measured feedback lags 56%, occupant behaviour 25%, weather 19%. In plain terms: occupant behaviour and schedules are most likely the primary drivers of the performance gap; weather is most likely secondary. Try one of the suggested questions for detailed evidence.`;

export function AssistantPanel({ onClose }: { onClose: () => void }) {
  const { data } = useData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [liveMode, setLiveMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const mimoMutation = trpc.assistant.ask.useMutation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Check scripted answers first (always available)
    const scripted = SCRIPTED[text];

    if (!liveMode || scripted) {
      // Use scripted answer
      const assistantMsg: Message = scripted
        ? { role: 'assistant', text: scripted.answer, tag: scripted.tag, source: 'scripted' }
        : { role: 'assistant', text: FALLBACK_ANSWER, source: 'fallback' };
      setMessages(prev => [...prev, assistantMsg]);
      return;
    }

    // Live mode: call MiMo via server proxy with 3s timeout
    setLoading(true);
    try {
      type MiMoResult = { answer: string; tag: string | null; source: 'live' | 'scripted' | 'fallback' };
      const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000));
      const result: MiMoResult = await Promise.race([
        mimoMutation.mutateAsync({ question: text }) as Promise<MiMoResult>,
        timeoutPromise,
      ]);

      if (result && result.answer) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: result.answer,
          tag: result.source === 'live' ? 'AI live' : (result.tag ?? undefined),
          source: result.source,
        }]);
      } else {
        throw new Error('empty');
      }
    } catch {
      // Timeout or error: fall back to scripted or generic
      const scriptedFallback = SCRIPTED[text];
      const fallbackMsg: Message = scriptedFallback
        ? { role: 'assistant', text: scriptedFallback.answer, tag: scriptedFallback.tag, source: 'scripted' }
        : { role: 'assistant', text: FALLBACK_ANSWER, source: 'fallback' };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sourceColor: Record<string, string> = {
    live: '#10B981',
    scripted: '#0EA5E9',
    fallback: '#8A9BB5',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '340px',
        background: '#0D1420',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#0EA5E9" strokeWidth="1" />
              <path d="M4.5 5.5C4.5 4.1 5.6 3 7 3s2.5 1.1 2.5 2.5c0 1.1-.7 2-1.7 2.4V9h-1.6V7.9C5.2 7.5 4.5 6.6 4.5 5.5z" fill="#0EA5E9" opacity="0.8" />
              <circle cx="7" cy="11" r="0.8" fill="#0EA5E9" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#E8EDF5' }}>Ask the twin</div>
            <div style={{ fontSize: '9px', color: '#8A9BB5' }}>Calibrated model · LightGBM</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Live mode toggle */}
          <button
            onClick={() => setLiveMode(v => !v)}
            title={liveMode ? 'Live mode ON (custom LLM)' : 'Live mode OFF (scripted)'}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 600,
              background: liveMode ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
              border: liveMode ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
              color: liveMode ? '#10B981' : '#8A9BB5',
              cursor: 'pointer', transition: 'all 150ms ease',
            }}
          >
            {liveMode ? <Zap size={9} /> : <ZapOff size={9} />}
            {liveMode ? 'Live' : 'Scripted'}
          </button>
          <button onClick={onClose} style={{ color: '#8A9BB5', padding: '4px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '20px' }}>
            <div style={{ fontSize: '11px', color: '#8A9BB5', marginBottom: '14px', lineHeight: 1.5 }}>
              Ask about the energy gap, model accuracy, or key drivers.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                    background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)',
                    color: '#0EA5E9', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 150ms ease',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'user' ? (
              <div style={{ maxWidth: '85%', padding: '8px 12px', borderRadius: '10px 10px 2px 10px', background: '#1A3A5C', fontSize: '12px', color: '#E8EDF5', lineHeight: 1.5 }}>
                {msg.text}
              </div>
            ) : (
              <div style={{ maxWidth: '95%' }}>
                <div style={{ padding: '10px 12px', borderRadius: '2px 10px 10px 10px', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', color: '#C8D4E3', lineHeight: 1.6 }}>
                  {msg.text}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {msg.tag && (
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '3px', fontSize: '9px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', background: `${sourceColor[msg.source || 'scripted']}18`, color: sourceColor[msg.source || 'scripted'], border: `1px solid ${sourceColor[msg.source || 'scripted']}30` }}>
                      {msg.tag}
                    </span>
                  )}
                  {msg.source && (
                    <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '3px', fontSize: '8px', color: '#3D4F6A', letterSpacing: '0.04em' }}>
                      {msg.source === 'live' ? 'MiMo v2 · OpenRouter' : msg.source === 'scripted' ? 'scripted · verified' : 'fallback'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '2px 10px 10px 10px', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', maxWidth: '95%' }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[0, 1, 2].map(n => (
                <div key={n} style={{ width: 5, height: 5, borderRadius: '50%', background: '#0EA5E9', opacity: 0.6, animation: `bounce 1.2s ${n * 0.2}s infinite ease-in-out` }} />
              ))}
            </div>
            <span style={{ fontSize: '10px', color: '#8A9BB5' }}>MiMo thinking...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested follow-ups (after conversation starts) */}
      {messages.length > 0 && !loading && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', gap: '4px', flexShrink: 0 }}>
          {SUGGESTED.filter(q => !messages.some(m => m.role === 'user' && m.text === q)).slice(0, 2).map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8A9BB5', cursor: 'pointer', transition: 'all 150ms ease' }}
            >
              {q.length > 32 ? q.slice(0, 32) + '...' : q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && sendMessage(input)}
            placeholder={liveMode ? 'Ask MiMo anything...' : 'Ask a follow-up...'}
            disabled={loading}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '11px', color: '#E8EDF5', fontFamily: 'DM Sans, sans-serif' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={{ color: input.trim() && !loading ? '#0EA5E9' : '#3D4F6A', background: 'none', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', padding: '2px', transition: 'color 150ms ease' }}
          >
            <Send size={14} />
          </button>
        </div>
        {liveMode && (
          <div style={{ fontSize: '8px', color: '#3D4F6A', marginTop: '4px', textAlign: 'center' }}>
            MiMo v2 · grounded by verified figures · scripted fallback on timeout
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
