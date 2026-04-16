import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { denialTags, colors } from '../theme';

interface DenyModalProps {
  onConfirm: (tags: string[], notes: string) => void;
  onCancel: () => void;
}

export function DenyModal({ onConfirm, onCancel }: DenyModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const firstTagRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstTagRef.current?.focus();
  }, []);

  const toggle = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(t => t !== id) : [...s, id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (selected.length > 0) onConfirm(selected, notes);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      onKeyDown={handleKeyDown}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          background: '#1a1a2e',
          borderRadius: 16,
          padding: 28,
          width: 480,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h3 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 17,
          marginBottom: 6,
          color: colors.deny,
        }}>Why is this being denied?</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
          Tab through tags, Space to toggle. ⌘↵ to confirm.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }} role="group" aria-label="Denial reasons">
          {denialTags.map((tag, i) => {
            const isOn = selected.includes(tag.id);
            return (
              <button
                key={tag.id}
                ref={i === 0 ? firstTagRef : undefined}
                onClick={() => toggle(tag.id)}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggle(tag.id);
                  }
                }}
                tabIndex={0}
                role="checkbox"
                aria-checked={isOn}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  background: isOn ? 'rgba(181,61,45,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isOn ? 'rgba(181,61,45,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: isOn ? colors.deny : 'rgba(255,255,255,0.5)',
                  transition: 'all 120ms ease',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.deny}40`; }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Optional: add specific feedback for the agent..."
          rows={3}
          tabIndex={0}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: '#e0e0e0',
            fontSize: 13,
            resize: 'vertical',
            fontFamily: 'inherit',
            marginBottom: 18,
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            {selected.length > 0 ? `${selected.length} selected · ⌘↵ to deny` : 'Select at least one reason'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onCancel}
              tabIndex={0}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
              }}
            >Cancel</button>
            <button
              onClick={() => selected.length > 0 && onConfirm(selected, notes)}
              disabled={selected.length === 0}
              tabIndex={0}
              style={{
                padding: '9px 22px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: selected.length > 0 ? colors.deny : 'rgba(255,255,255,0.04)',
                color: selected.length > 0 ? '#fff' : 'rgba(255,255,255,0.2)',
                border: 'none',
                opacity: selected.length === 0 ? 0.6 : 1,
                cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >Deny</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
