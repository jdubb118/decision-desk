import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RouteDoc {
  method: string;
  path: string;
  documented: boolean;
  summary: string | null;
  auth: string | null;
  query: Record<string, string> | null;
  body: Record<string, string> | null;
}

interface RoutesResponse {
  generated_at: string;
  total: number;
  documented: number;
  undocumented: string[];
  routes: RouteDoc[];
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#3d5a73',
  POST: '#2d7a4f',
  PATCH: '#b5770d',
  PUT: '#b5770d',
  DELETE: '#b53d2d',
};

export function ApiDocsButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open API documentation"
        style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 90,
          padding: '7px 12px', borderRadius: 20,
          background: 'rgba(10,10,20,0.85)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em',
          cursor: 'pointer', backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        {'{ }'} API docs
      </button>
      <AnimatePresence>
        {open && <ApiDocsPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function ApiDocsPanel({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<RoutesResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/routes')
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(setData)
      .catch(e => setErr(e.message));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtered = data?.routes.filter(r =>
    !filter || r.path.toLowerCase().includes(filter.toLowerCase()) || (r.summary || '').toLowerCase().includes(filter.toLowerCase())
  ) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
        display: 'flex', justifyContent: 'flex-end',
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="API documentation"
        initial={{ x: 520 }}
        animate={{ x: 0 }}
        exit={{ x: 520 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 680, maxWidth: '100vw', height: '100vh',
          background: '#0d0d1a', borderLeft: '1px solid rgba(255,255,255,0.08)',
          overflowY: 'auto', padding: 24,
          color: '#e0e0e0',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h2 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 22, fontWeight: 700, margin: 0, flex: 1,
          }}>API</h2>
          <button onClick={onClose} aria-label="Close" style={{
            width: 28, height: 28, borderRadius: 6, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
            fontSize: 18, cursor: 'pointer', border: 'none',
          }}>×</button>
        </div>

        {data && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>
            {data.documented}/{data.total} documented
            {data.undocumented.length > 0 && (
              <span style={{ color: '#b5770d', marginLeft: 10 }}>
                · {data.undocumented.length} undocumented
              </span>
            )}
          </div>
        )}

        <input
          type="search"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter routes…"
          style={{
            width: '100%', padding: '8px 12px', marginBottom: 16,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6, color: '#e0e0e0', fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        />

        {err && (
          <div style={{ padding: 12, background: 'rgba(181,61,45,0.15)', borderRadius: 6, color: '#ff6b5a', fontSize: 13 }}>
            Failed to load routes: {err}
          </div>
        )}

        {!data && !err && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading…</div>
        )}

        {data && data.undocumented.length > 0 && !filter && (
          <div style={{
            padding: 12, marginBottom: 16, borderRadius: 6,
            background: 'rgba(181,119,13,0.1)', border: '1px solid rgba(181,119,13,0.3)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ffb54a', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
              Undocumented routes
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
              {data.undocumented.map(r => <div key={r}>{r}</div>)}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
              Add a description to <code>ROUTE_DOCS</code> in <code>server.mjs</code> or delete the route.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(r => {
            const color = METHOD_COLORS[r.method] || '#888';
            return (
              <div key={`${r.method}-${r.path}`} style={{
                padding: '12px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: r.summary || r.query || r.body ? 8 : 0 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                    background: `${color}25`, color, letterSpacing: '0.04em',
                    fontFamily: "'JetBrains Mono', monospace",
                    minWidth: 52, textAlign: 'center',
                  }}>{r.method}</span>
                  <code style={{
                    fontSize: 13, color: '#e0e0e0',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 500,
                  }}>{r.path}</code>
                  {!r.documented && (
                    <span style={{ fontSize: 10, color: '#b5770d', marginLeft: 'auto', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>undocumented</span>
                  )}
                </div>
                {r.summary && (
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55, marginLeft: 0 }}>
                    {r.summary}
                  </div>
                )}
                {r.query && (
                  <ParamList label="Query" params={r.query} />
                )}
                {r.body && (
                  <ParamList label="Body" params={r.body} />
                )}
              </div>
            );
          })}
          {filtered.length === 0 && data && filter && (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: 20, textAlign: 'center' }}>
              No routes match "{filter}"
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ParamList({ label, params }: { label: string; params: Record<string, string> }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 12px', fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace" }}>
        {Object.entries(params).map(([k, v]) => (
          <Fragment key={k}>
            <span style={{ color: '#c4b5fd' }}>{k}</span>
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>{v}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
