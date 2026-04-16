import { useState } from 'react';
import { motion } from 'framer-motion';
import { agents, colors } from '../theme';
import type { Deliverable } from '../types/deliverable';

interface DiscussPanelProps {
  deliverable: Deliverable;
  onSubmit: (msg: string) => void;
  onClose: () => void;
}

export function DiscussPanel({ deliverable, onSubmit, onClose }: DiscussPanelProps) {
  const [msg, setMsg] = useState('');

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 380,
        background: '#12121f',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{
        padding: '16px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          color: colors.discuss,
        }}>Discuss with {agents[deliverable.agent_id]?.label}</span>
        <button onClick={onClose} style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', padding: 4, cursor: 'pointer' }}>×</button>
      </div>

      <div style={{
        padding: 14,
        background: 'rgba(255,255,255,0.03)',
        margin: 16,
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
      }}>
        <div style={{ fontWeight: 500, marginBottom: 2, color: 'rgba(255,255,255,0.7)' }}>{deliverable.title}</div>
        <div style={{ fontSize: 12 }}>
          Your message will ping them on Telegram immediately.
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px' }}>
        <textarea
          autoFocus
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) onSubmit(msg); }}
          placeholder="What needs to change? Be specific..."
          style={{
            width: '100%',
            height: 160,
            padding: 14,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: '#e0e0e0',
            fontSize: 13,
            lineHeight: 1.6,
            resize: 'none',
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>
          ⌘↵ to send
        </div>
      </div>

      <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => msg.trim() && onSubmit(msg)}
          disabled={!msg.trim()}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 10,
            background: msg.trim() ? colors.discuss : 'rgba(255,255,255,0.04)',
            color: msg.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            transition: 'all 150ms ease',
            cursor: msg.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Send & move to discuss
        </button>
      </div>
    </motion.div>
  );
}
