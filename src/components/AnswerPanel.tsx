import { useState } from 'react';
import { motion } from 'framer-motion';
import { agents, colors } from '../theme';
import type { Deliverable } from '../types/deliverable';

interface AnswerPanelProps {
  deliverable: Deliverable;
  onSubmit: (text: string) => void;
  onClose: () => void;
}

export function AnswerPanel({ deliverable, onSubmit, onClose }: AnswerPanelProps) {
  const [answer, setAnswer] = useState('');
  const agentLabel = agents[deliverable.agent_id]?.label || deliverable.agent_id;
  const question = String((deliverable.metadata as Record<string, unknown>)?.question || deliverable.title);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 380,
        background: '#12121f', borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', zIndex: 40,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: colors.approve }}>
          Answer to {agentLabel}
        </span>
        <button onClick={onClose} style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', padding: 4, cursor: 'pointer' }}>×</button>
      </div>

      <div style={{ margin: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Their question</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{question}</p>
      </div>

      <div style={{ flex: 1, padding: '0 16px' }}>
        <textarea
          autoFocus
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) onSubmit(answer); }}
          placeholder="Your answer — they'll act on this in their next heartbeat..."
          style={{
            width: '100%', height: 180, padding: 14, borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
            color: '#e0e0e0', fontSize: 13, lineHeight: 1.6,
            resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>⌘↵ to send</div>
      </div>

      <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => answer.trim() && onSubmit(answer)}
          disabled={!answer.trim()}
          style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: answer.trim() ? colors.approve : 'rgba(255,255,255,0.04)',
            color: answer.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
            fontSize: 14, fontWeight: 600, border: 'none', transition: 'all 150ms ease',
            cursor: answer.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Send Answer
        </button>
      </div>
    </motion.div>
  );
}
