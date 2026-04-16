import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useBrand } from '../App';
import { agents, colors } from '../theme';
import { useSound } from '../hooks/useSound';
import { SwipeableCard } from '../components/SwipeableCard';
import { CardPreview } from '../components/CardPreview';
import { ActionBar } from '../components/ActionBar';
import { DenyModal } from '../components/DenyModal';
import { DiscussPanel } from '../components/DiscussPanel';
import { AnswerPanel } from '../components/AnswerPanel';
import type { Deliverable, SwipeDirection, SessionStats } from '../types/deliverable';

export default function DecisionDesk() {
  const { brand } = useBrand();
  const [searchParams, setSearchParams] = useSearchParams();
  const [queue, setQueue] = useState<Deliverable[]>([]);
  const [idx, setIdx] = useState(0);
  const [exitDirection, setExitDirection] = useState<SwipeDirection>(null);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showDiscussPanel, setShowDiscussPanel] = useState(false);
  const [showAnswerPanel, setShowAnswerPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewWidth, setPreviewWidth] = useState<'mobile' | 'desktop'>('desktop');
  const [sessionStart] = useState(() => new Date().toISOString());
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const playSound = useSound();

  const loadQueue = useCallback((reset = false) => {
    fetch(`/api/deliverables?status=submitted&brand=${brand}`)
      .then(r => r.json())
      .then(data => {
        const arr: Deliverable[] = Array.isArray(data) ? data : [];
        for (const d of arr) {
          if (typeof d.metadata === 'string') {
            try { d.metadata = JSON.parse(d.metadata); } catch { d.metadata = null; }
          }
          if (typeof d.validation_results === 'string') {
            try { d.validation_results = JSON.parse(d.validation_results); } catch { d.validation_results = null; }
          }
        }
        setQueue(prev => {
          if (reset || prev.length === 0) return arr;
          const currentId = prev[idx]?.id;
          if (!currentId) return arr;
          const newIdx = arr.findIndex(d => d.id === currentId);
          if (newIdx >= 0) setIdx(newIdx);
          return arr;
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [brand, idx]);

  const loadExtras = useCallback(() => {
    fetch(`/api/session-stats?since=${encodeURIComponent(sessionStart)}`)
      .then(r => r.json())
      .then(d => setSessionStats(d))
      .catch(() => {});
  }, [sessionStart]);

  useEffect(() => {
    setIdx(0);
    setLoading(true);
    loadQueue(true);
    loadExtras();
    const t = setInterval(() => { loadQueue(); loadExtras(); }, 30000);
    return () => clearInterval(t);
  // Only reset on brand change, not on loadQueue identity change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  useEffect(() => {
    const reviewId = searchParams.get('review');
    if (!reviewId || queue.length === 0) return;
    const targetIdx = queue.findIndex(d => d.id === reviewId);
    if (targetIdx !== -1) {
      setIdx(targetIdx);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, queue, setSearchParams]);

  const current = queue[idx];
  const next = queue[idx + 1] || null;
  const total = queue.length;

  const handleDecision = async (verdict: string, tags?: string[], notes?: string) => {
    if (!current || submitting) return;
    if (verdict === 'skip') {
      const newQueue = queue.filter(d => d.id !== current.id);
      setQueue(newQueue);
      setIdx(i => Math.min(i, newQueue.length - 1));
      return;
    }
    const isApprove = ['approved', 'advance', 'act', 'answered'].includes(verdict);
    const isDeny = ['denied', 'kill', 'pass'].includes(verdict);
    const dir: SwipeDirection = isApprove ? 'approve' : isDeny ? 'deny' : 'discuss';
    setSubmitting(true);
    setSubmitError(null);
    setExitDirection(dir);
    playSound(dir || 'approve');

    let ok = false;
    try {
      const r = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliverable_id: current.id, verdict, denial_tags: tags, notes }),
      });
      ok = r.ok;
      if (!ok) {
        const body = await r.json().catch(() => ({}));
        setSubmitError(body.error || `Request failed (${r.status})`);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error');
    }

    setTimeout(() => {
      setExitDirection(null);
      setShowDenyModal(false);
      setSubmitting(false);
      if (ok) {
        const newQueue = queue.filter(d => d.id !== current.id);
        setQueue(newQueue);
        setIdx(i => Math.min(i, newQueue.length - 1));
        loadExtras();
      }
      // On failure, card stays in queue for retry — no phantom approvals.
    }, 400);
  };

  const triggerApprove = useCallback(() => {
    if (!current) return;
    if (current.type === 'question') setShowAnswerPanel(true);
    else if (current.type === 'performance-update') handleDecision('advance');
    else if (current.type === 'recommendation' || current.type === 'research-summary') handleDecision('act');
    else if (current.type === 'decision-point') {
      const opts = Array.isArray(current?.metadata?.options) ? (current.metadata!.options as Array<{ label: string }>) : [];
      handleDecision('approved', [], opts[0]?.label);
    }
    else handleDecision('approved');
  }, [current, handleDecision]);

  const triggerDeny = useCallback(() => {
    if (!current) return;
    if (current.type === 'question') handleDecision('skip');
    else if (current.type === 'performance-update') handleDecision('kill');
    else if (current.type === 'recommendation' || current.type === 'influencer-proposal') handleDecision('pass');
    else if (current.type === 'research-summary') handleDecision('approved');
    else if (current.type === 'blocker-escalation') handleDecision('denied');
    else if (current.type === 'content-brief') handleDecision('denied');
    else if (current.type === 'decision-point') {
      const opts = Array.isArray(current?.metadata?.options) ? (current.metadata!.options as Array<{ label: string }>) : [];
      handleDecision('pass', [], opts[1]?.label);
    }
    else setShowDenyModal(true);
  }, [current, handleDecision]);

  const triggerDiscuss = useCallback(() => {
    setShowDiscussPanel(true);
  }, []);

  const triggerSkip = useCallback(() => {
    if (!current || total <= 1) return;
    setIdx(i => (i + 1) % total);
  }, [current, total]);

  // Keyboard: Arrow keys for decisions
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.querySelector('[data-modal]')) return;
      if (showDenyModal || showDiscussPanel || showAnswerPanel) {
        if (e.key === 'Escape') {
          setShowDenyModal(false);
          setShowDiscussPanel(false);
          setShowAnswerPanel(false);
        }
        return;
      }
      if (e.key === 'ArrowRight') { e.preventDefault(); triggerApprove(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); triggerDeny(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); triggerDiscuss(); }
      if (e.key === 'Escape') { e.preventDefault(); triggerSkip(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDenyModal, showDiscussPanel, showAnswerPanel, triggerApprove, triggerDeny, triggerDiscuss, triggerSkip]);

  const handleSwipe = useCallback((action: 'approve' | 'deny' | 'discuss') => {
    if (action === 'approve') triggerApprove();
    else if (action === 'deny') triggerDeny();
    else if (action === 'discuss') triggerDiscuss();
  }, [triggerApprove, triggerDeny, triggerDiscuss]);

  const handleDiscuss = async (message: string) => {
    if (!current || !message.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    let ok = false;
    try {
      const r = await fetch('/api/discuss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliverable_id: current.id, author: 'reviewer', body: message }),
      });
      ok = r.ok;
      if (!ok) {
        const body = await r.json().catch(() => ({}));
        setSubmitError(body.error || `Request failed (${r.status})`);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error');
    }
    setSubmitting(false);
    if (ok) {
      setShowDiscussPanel(false);
      const newQueue = queue.filter(d => d.id !== current.id);
      setQueue(newQueue);
      setIdx(i => Math.min(i, newQueue.length - 1));
    }
  };

  const handleAnswer = async (text: string) => {
    if (!current || !text.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    let ok = false;
    try {
      const r = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliverable_id: current.id, verdict: 'answered', notes: text }),
      });
      ok = r.ok;
      if (!ok) {
        const body = await r.json().catch(() => ({}));
        setSubmitError(body.error || `Request failed (${r.status})`);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error');
    }
    setShowAnswerPanel(false);
    setExitDirection('approve');
    setTimeout(() => {
      setExitDirection(null);
      setSubmitting(false);
      if (ok) {
        const newQueue = queue.filter(d => d.id !== current.id);
        setQueue(newQueue);
        setIdx(i => Math.min(i, newQueue.length - 1));
      }
    }, 400);
  };

  if (loading) return <LoadingState />;
  if (total === 0 || !current) return <EmptyState brand={brand} sessionStats={sessionStats} />;

  const agent = agents[current.agent_id] || { label: current.agent_id, color: colors.textMuted };
  const dpOptions = (current.type === 'decision-point' && Array.isArray(current?.metadata?.options))
    ? (current.metadata!.options as Array<{ id?: string; label: string; description?: string }>).slice(0, 3)
    : null;
  const isBlocked = current.validation_status === 'blocked';

  return (
    <div style={{
      height: 'calc(100vh - 52px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      background: '#0a0a14',
    }}>
      {/* Compact header — single line */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 16px',
        background: '#0d0d1a',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexShrink: 0,
        minHeight: 0,
      }}>
        <span style={{ fontSize: 11, color: agent.color, fontWeight: 600, background: `${agent.color}18`, padding: '1px 7px', borderRadius: 10 }}>{agent.label}</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{current.type.replace(/-/g, ' ')}</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current.title}</span>
        {current.version > 1 && <span style={{ fontSize: 9, color: colors.discuss, fontWeight: 600 }}>v{current.version}</span>}
        {current.type === 'email-html' && (
          <div style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 1 }}>
            {(['mobile', 'desktop'] as const).map(w => (
              <button key={w} onClick={() => setPreviewWidth(w)} style={{
                padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 500,
                background: previewWidth === w ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: previewWidth === w ? '#ccc' : 'rgba(255,255,255,0.2)',
                border: 'none', cursor: 'pointer',
              }}>{w === 'mobile' ? '📱' : '🖥'}</button>
            ))}
          </div>
        )}
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
          {idx + 1}<span style={{ opacity: 0.4 }}>/{total}</span>
        </span>
      </div>

      {/* Main card area — maximum space */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#0a0a14' }}>
        <SwipeableCard
          current={current}
          next={next}
          onSwipe={handleSwipe}
          exitDirection={exitDirection}
        >
          <CardPreview deliverable={current} previewWidth={previewWidth} />
        </SwipeableCard>
      </div>

      {/* Action bar */}
      <ActionBar
        type={current.type}
        dpOptions={dpOptions}
        isBlocked={isBlocked}
        onApprove={triggerApprove}
        onDiscuss={triggerDiscuss}
        onDeny={triggerDeny}
        onSkip={triggerSkip}
        queuePosition={idx + 1}
        queueTotal={total}
      />

      {/* Submit error banner */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setSubmitError(null)}
            style={{
              position: 'absolute', top: 52, left: 0, right: 0,
              padding: '8px 16px', background: '#b53d2d', color: '#fff',
              fontSize: 12, fontWeight: 600, textAlign: 'center',
              cursor: 'pointer', zIndex: 100,
            }}
          >
            ⚠ {submitError} · click to dismiss
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showDenyModal && <DenyModal onConfirm={(tags, notes) => handleDecision('denied', tags, notes)} onCancel={() => setShowDenyModal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showDiscussPanel && <DiscussPanel deliverable={current} onSubmit={handleDiscuss} onClose={() => setShowDiscussPanel(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAnswerPanel && <AnswerPanel deliverable={current} onSubmit={handleAnswer} onClose={() => setShowAnswerPanel(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ── Empty State ──
function EmptyState({ brand, sessionStats }: { brand: string; sessionStats: SessionStats | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        height: 'calc(100vh - 52px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        textAlign: 'center',
        background: '#0a0a14',
      }}
    >
      <div style={{
        width: 64, height: 64,
        borderRadius: '50%',
        background: 'rgba(45,122,79,0.1)',
        border: '2px solid rgba(45,122,79,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
      }}>
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <polyline points="20 6 9 17 4 12" stroke="#2d7a4f" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 style={{
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: 28, fontWeight: 700,
        color: '#e0e0e0',
        marginBottom: 8,
      }}>
        Queue clear
      </h2>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', maxWidth: 300, lineHeight: 1.65 }}>
        No pending {brand.toUpperCase()} decisions. The team is working on the next batch.
      </p>

      {sessionStats && sessionStats.count > 0 && (
        <div style={{ display: 'flex', gap: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', marginTop: 24 }}>
          {sessionStats.approvals > 0 && (
            <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, color: colors.approve }}>{sessionStats.approvals}</div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Approved</div>
            </div>
          )}
          {sessionStats.denials > 0 && (
            <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.03)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, color: colors.deny }}>{sessionStats.denials}</div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Denied</div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Loading State ──
function LoadingState() {
  return (
    <div style={{
      height: 'calc(100vh - 52px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a14',
      color: 'rgba(255,255,255,0.3)',
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        style={{
          width: 20, height: 20,
          border: '2px solid rgba(255,255,255,0.08)',
          borderTopColor: 'var(--brand-accent)',
          borderRadius: '50%',
          marginRight: 10,
        }}
      />
      Loading...
    </div>
  );
}
