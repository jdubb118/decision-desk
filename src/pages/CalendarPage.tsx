import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBrand } from '../App';
import CalendarMockup from '../components/CalendarMockup';

// Channel color map
const CHANNEL_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  instagram: { bg: 'rgba(225,48,108,0.18)', text: '#e1306c', label: 'IG' },
  facebook: { bg: 'rgba(66,103,178,0.18)', text: '#4267b2', label: 'FB' },
  email: { bg: 'rgba(61,90,115,0.18)', text: '#6b9bc4', label: 'Email' },
  tiktok: { bg: 'rgba(255,255,255,0.08)', text: '#e0e0e0', label: 'TikTok' },
  sms: { bg: 'rgba(45,122,79,0.18)', text: '#4ade80', label: 'SMS' },
  youtube: { bg: 'rgba(255,0,0,0.15)', text: '#ff4444', label: 'YT' },
  linkedin: { bg: 'rgba(10,102,194,0.18)', text: '#0a66c2', label: 'LI' },
  homepage: { bg: 'rgba(196,163,90,0.18)', text: '#c4a35a', label: 'Web' },
  'google-ads': { bg: 'rgba(66,133,244,0.18)', text: '#4285f4', label: 'GAds' },
  'meta-ads': { bg: 'rgba(99,102,241,0.18)', text: '#8b8ef7', label: 'Meta' },
  blog: { bg: 'rgba(45,122,79,0.18)', text: '#2d7a4f', label: 'Blog' },
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'rgba(255,255,255,0.2)',
  produced: '#b5770d',
  approved: '#2d7a4f',
  posted: '#4ade80',
  staged: '#6b9bc4',
  killed: '#b53d2d',
};

const SCORE_COLORS: Record<string, string> = {
  A: '#2d7a4f',
  B: '#6b9bc4',
  C: '#b5770d',
  D: '#b53d2d',
};

interface CalendarEntry {
  id: string;
  brand: string;
  date: string;
  channel: string;
  sub_channel: string | null;
  campaign_name: string | null;
  campaign_month: string | null;
  concept: string | null;
  why_hook: string | null;
  content_split: string | null;
  product_json: string | null;
  copy_direction: string | null;
  final_copy: string | null;
  asset_json: string | null;
  status: string;
  paid_note: string | null;
  notes: string | null;
  posted_at: string | null;
  platform_draft_id: string | null;
  staged_at: string | null;
  performance_json: string | null;
  tier: string;
  active_flags: number;
}

interface CalendarStats {
  brands: Array<{
    brand: string;
    total: number;
    draft: number;
    produced: number;
    posted: number;
    production_tier: number;
    planned_tier: number;
    horizon_tier: number;
    has_performance: number;
    needs_copy: number;
  }>;
  channels?: Array<{ brand: string; channel: string; count: number }>;
  open_flags: number;
  assets_needed: number;
}

function getChannelInfo(channel: string) {
  return CHANNEL_COLORS[channel] || { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.4)', label: channel };
}

function parsePerformance(json: string | null): { score?: string } | null {
  if (!json) return null;
  try { return JSON.parse(json); } catch { return null; }
}

function parseProduct(json: string | null): { name?: string; sku?: string; price?: number } | null {
  if (!json) return null;
  try { return JSON.parse(json); } catch { return null; }
}

// Month navigation helpers
function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m) - 1]} ${y}`;
}

function addMonths(key: string, n: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return monthKey(d);
}

// Format a JS Date as YYYY-MM-DD using its LOCAL Y/M/D (no UTC conversion)
function fmtLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Get all days in a month as grid (padded to weeks)
function getMonthGrid(key: string): Array<{ date: string; inMonth: boolean; dayNum: number; dow: number }> {
  const [y, m] = key.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const startDow = first.getDay(); // 0=Sun

  const grid: Array<{ date: string; inMonth: boolean; dayNum: number; dow: number }> = [];

  // Pad start (days from previous month)
  for (let i = 0; i < startDow; i++) {
    const d = new Date(y, m - 1, -startDow + i + 1);
    grid.push({ date: fmtLocal(d), inMonth: false, dayNum: d.getDate(), dow: i });
  }

  // Month days
  for (let d = 1; d <= last.getDate(); d++) {
    const dt = new Date(y, m - 1, d);
    grid.push({ date: fmtLocal(dt), inMonth: true, dayNum: d, dow: dt.getDay() });
  }

  // Pad end to complete week
  const remaining = 7 - (grid.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(y, m, i);
      grid.push({ date: fmtLocal(d), inMonth: false, dayNum: d.getDate(), dow: d.getDay() });
    }
  }

  return grid;
}

// ---------- Detail Panel ----------
function EntryDetail({ entry, onClose }: { entry: CalendarEntry; onClose: () => void }) {
  const ch = getChannelInfo(entry.channel);
  const perf = parsePerformance(entry.performance_json);
  const product = parseProduct(entry.product_json);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Calendar entry: ${entry.concept || entry.id}`} style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '100vw',
      background: '#0d0d1a', borderLeft: '1px solid rgba(255,255,255,0.08)',
      zIndex: 100, overflowY: 'auto', padding: 24,
      boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
            background: ch.bg, color: ch.text,
          }}>{ch.label}</span>
          {entry.sub_channel && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{entry.sub_channel}</span>
          )}
          {entry.active_flags > 0 && (
            <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 10, background: 'rgba(181,61,45,0.2)', color: '#ff6b5a' }}>
              {entry.active_flags} flag{entry.active_flags > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button onClick={onClose} aria-label="Close detail panel" style={{
          width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 18,
        }}>×</button>
      </div>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
        {entry.date} &middot; {entry.brand.toUpperCase()} &middot; {entry.campaign_name || 'No campaign'}
      </div>

      <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
        {entry.concept || 'Untitled'}
      </h3>

      {entry.why_hook && (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontStyle: 'italic' }}>
          {entry.why_hook}
        </p>
      )}

      {/* Status + Tier + Score */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{
          padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          background: `${STATUS_COLORS[entry.status] || 'rgba(255,255,255,0.1)'}22`,
          color: STATUS_COLORS[entry.status] || 'rgba(255,255,255,0.4)',
          border: `1px solid ${STATUS_COLORS[entry.status] || 'rgba(255,255,255,0.1)'}44`,
        }}>{entry.status}</span>
        <span style={{
          padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          background: entry.tier === 'production' ? 'rgba(45,122,79,0.15)' : entry.tier === 'planned' ? 'rgba(181,119,13,0.15)' : 'rgba(255,255,255,0.04)',
          color: entry.tier === 'production' ? '#4ade80' : entry.tier === 'planned' ? '#fbbf24' : 'rgba(255,255,255,0.25)',
        }}>{entry.tier}</span>
        {entry.content_split && (
          <span style={{
            padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            background: 'rgba(99,102,241,0.12)', color: '#8b8ef7',
          }}>{entry.content_split}</span>
        )}
        {perf?.score && (
          <span style={{
            padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 800,
            background: `${SCORE_COLORS[perf.score] || '#666'}22`,
            color: SCORE_COLORS[perf.score] || '#666',
          }}>Score: {perf.score}</span>
        )}
      </div>

      {/* Copy */}
      {(entry.final_copy || entry.copy_direction) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {entry.final_copy ? 'Final Copy' : 'Copy Direction'}
          </div>
          <div style={{
            padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)', fontSize: 13, lineHeight: 1.6,
            color: 'rgba(255,255,255,0.75)', whiteSpace: 'pre-wrap',
          }}>
            {entry.final_copy || entry.copy_direction}
          </div>
        </div>
      )}

      {/* Product */}
      {product?.name && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
            {product.name}{product.sku ? ` (${product.sku})` : ''}{product.price ? ` — $${product.price}` : ''}
          </div>
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{entry.notes}</div>
        </div>
      )}

      {/* Preview (visual mockup) */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Preview &middot; {entry.channel}{entry.sub_channel ? ` / ${entry.sub_channel}` : ''}
          </div>
          {!entry.final_copy && (entry.copy_direction || entry.concept) && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              padding: '2px 8px', borderRadius: 3, background: 'rgba(181,119,13,0.18)', color: '#f5a623',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Draft Copy
            </span>
          )}
        </div>
        <div style={{
          borderRadius: 10, padding: 12, background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.04)', overflow: 'auto',
          display: 'flex', justifyContent: 'center',
          // Scale very-wide mockups down to panel width. The panel is 420px wide minus 48px padding.
          // We use transform-origin top so the content anchors at the top.
          maxHeight: 640,
        }}>
          <div style={{ transform: 'scale(0.78)', transformOrigin: 'top center', width: '128%' }}>
            <CalendarMockup entry={entry} />
          </div>
        </div>
      </div>

      {/* Meta */}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono', monospace", marginTop: 24 }}>
        {entry.id}
        {entry.posted_at && <div>Posted: {entry.posted_at}</div>}
        {entry.staged_at && <div>Staged: {entry.staged_at}</div>}
        {entry.platform_draft_id && <div>Draft ID: {entry.platform_draft_id}</div>}
      </div>
    </div>
  );
}

// ---------- Main Calendar Page ----------
export default function CalendarPage() {
  const { brand } = useBrand();
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [channelFilter, setChannelFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setRefetching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brandFilter = brand === 'system' ? undefined : brand;

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true); else setRefetching(true);
    setError(null);
    try {
      const params = new URLSearchParams({ month });
      if (brandFilter) params.set('brand', brandFilter);
      if (channelFilter) params.set('channel', channelFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (tierFilter) params.set('tier', tierFilter);

      const [entriesRes, statsRes] = await Promise.all([
        fetch(`/api/calendar?${params}`),
        fetch('/api/calendar/stats'),
      ]);
      if (!entriesRes.ok || !statsRes.ok) {
        throw new Error(`API returned ${entriesRes.status}/${statsRes.status}`);
      }
      const [entriesData, statsData] = await Promise.all([entriesRes.json(), statsRes.json()]);
      setEntries(entriesData);
      setStats(statsData);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch calendar');
      console.error('Calendar fetch failed:', err);
    } finally {
      setLoading(false);
      setRefetching(false);
    }
  }, [month, brandFilter, channelFilter, statusFilter, tierFilter]);

  useEffect(() => {
    let initial = entries.length === 0;
    fetchData(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    try {
      const params = brandFilter ? `?brand=${brandFilter}` : '';
      const res = await fetch(`/api/calendar/import${params}`, { method: 'POST' });
      if (!res.ok) throw new Error(`Import failed: ${res.status}`);
      await fetchData(false);
    } catch (err: any) {
      setError(err?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  // ESC key closes detail panel
  useEffect(() => {
    if (!selectedEntry) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedEntry(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEntry]);

  // Group entries by date with pre-parsed performance (perf only computed once per fetch)
  const entriesByDate = useMemo(() => {
    const map: Record<string, Array<CalendarEntry & { _perfScore?: string }>> = {};
    for (const e of entries) {
      const perf = parsePerformance(e.performance_json);
      const enriched = perf?.score ? { ...e, _perfScore: perf.score } : e;
      (map[e.date] ||= []).push(enriched);
    }
    return map;
  }, [entries]);

  const grid = useMemo(() => getMonthGrid(month), [month]);
  const todayStr = useMemo(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date()), []);

  // Get unique channels for the current brand from STATS (all-time, not filtered) so pills don't disappear
  const channels = useMemo(() => {
    if (!stats?.channels) return [];
    const set = new Set<string>();
    stats.channels
      .filter(c => !brandFilter || c.brand === brandFilter)
      .forEach(c => set.add(c.channel));
    return Array.from(set).sort();
  }, [stats, brandFilter]);

  const brandStats = stats?.brands?.find(b => b.brand === brandFilter) || stats?.brands?.[0];

  return (
    <div style={{ height: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px', background: '#0d0d1a',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setMonth(addMonths(month, -1))} style={{
            padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.5)', fontSize: 14,
          }}>&larr;</button>
          <h2 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 700,
            color: '#fff', minWidth: 120, textAlign: 'center',
          }}>{monthLabel(month)}</h2>
          <button onClick={() => setMonth(addMonths(month, 1))} style={{
            padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.5)', fontSize: 14,
          }}>&rarr;</button>
          <button onClick={() => setMonth(monthKey(new Date()))} style={{
            padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600,
          }}>Today</button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Stats badges */}
        {brandStats && (
          <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{entries.length} entries</span>
            {stats?.assets_needed ? (
              <span style={{ color: '#b5770d' }}>{stats.assets_needed} assets needed</span>
            ) : null}
            {stats?.open_flags ? (
              <span style={{ color: '#ff6b5a' }}>{stats.open_flags} flags</span>
            ) : null}
          </div>
        )}

        <button onClick={handleImport} disabled={importing} style={{
          padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          background: importing ? 'rgba(255,255,255,0.04)' : 'rgba(45,122,79,0.15)',
          color: importing ? 'rgba(255,255,255,0.3)' : '#4ade80',
          border: '1px solid rgba(45,122,79,0.2)',
        }}>{importing ? 'Importing...' : 'Sync Calendars'}</button>
      </div>

      {/* Filters */}
      <div style={{
        padding: '8px 24px', display: 'flex', gap: 6, flexWrap: 'wrap',
        background: '#0a0a14', borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        {/* Channel filters */}
        <FilterPill label="All Channels" active={!channelFilter} onClick={() => setChannelFilter(null)} />
        {channels.map(ch => {
          const info = getChannelInfo(ch);
          return (
            <FilterPill key={ch} label={info.label} active={channelFilter === ch}
              onClick={() => setChannelFilter(channelFilter === ch ? null : ch)}
              color={info.text} />
          );
        })}
        <span style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        {/* Status filters */}
        <FilterPill label="All Status" active={!statusFilter} onClick={() => setStatusFilter(null)} />
        {['draft', 'produced', 'approved', 'posted', 'killed'].map(s => (
          <FilterPill key={s} label={s} active={statusFilter === s}
            onClick={() => setStatusFilter(statusFilter === s ? null : s)}
            color={STATUS_COLORS[s]} />
        ))}
        <span style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        {/* Tier filters */}
        <FilterPill label="All Tiers" active={!tierFilter} onClick={() => setTierFilter(null)} />
        <FilterPill label="Production" active={tierFilter === 'production'} onClick={() => setTierFilter(tierFilter === 'production' ? null : 'production')} color="#4ade80" />
        <FilterPill label="Planned" active={tierFilter === 'planned'} onClick={() => setTierFilter(tierFilter === 'planned' ? null : 'planned')} color="#fbbf24" />
        <FilterPill label="Horizon" active={tierFilter === 'horizon'} onClick={() => setTierFilter(tierFilter === 'horizon' ? null : 'horizon')} color="rgba(255,255,255,0.25)" />
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          padding: '8px 24px', background: 'rgba(181,61,45,0.15)', color: '#ff6b5a',
          fontSize: 12, borderBottom: '1px solid rgba(181,61,45,0.3)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>Error: {error}</span>
          <button onClick={() => fetchData(false)} style={{
            padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
            background: 'rgba(181,61,45,0.2)', color: '#ff6b5a',
          }}>Retry</button>
        </div>
      )}

      {/* Calendar Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px', position: 'relative' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
        ) : (
          <>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 2 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{
                  padding: '6px 8px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textAlign: 'center',
                }}>{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {grid.map((day, i) => {
                const dayEntries = entriesByDate[day.date] || [];
                const isToday = day.date === todayStr;

                return (
                  <div key={i} style={{
                    minHeight: 100, padding: 6,
                    background: isToday ? 'rgba(99,102,241,0.06)' : day.inMonth ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.005)',
                    border: isToday ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.03)',
                    borderRadius: 4,
                    opacity: day.inMonth ? 1 : 0.4,
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#8b8ef7' : 'rgba(255,255,255,0.35)',
                      marginBottom: 4, fontFamily: "'JetBrains Mono', monospace",
                    }}>{day.dayNum}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {dayEntries.slice(0, 6).map(entry => {
                        const ch = getChannelInfo(entry.channel);
                        const score = (entry as any)._perfScore as string | undefined;
                        const tierOpacity = entry.tier === 'horizon' ? 0.4 : entry.tier === 'planned' ? 0.7 : 1;

                        return (
                          <button key={entry.id} onClick={() => setSelectedEntry(entry)} style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '2px 6px', borderRadius: 4, fontSize: 10,
                            background: ch.bg, color: ch.text, opacity: tierOpacity,
                            textAlign: 'left', width: '100%', cursor: 'pointer',
                            border: entry.active_flags > 0 ? '1px solid rgba(255,107,90,0.4)' : '1px solid transparent',
                            transition: 'all 150ms',
                          }}>
                            <span style={{ fontWeight: 600, flexShrink: 0 }}>{ch.label}</span>
                            {entry.sub_channel && (
                              <span style={{ opacity: 0.6, fontSize: 9 }}>{entry.sub_channel}</span>
                            )}
                            {score && (
                              <span style={{
                                marginLeft: 'auto', fontWeight: 800, fontSize: 9,
                                color: SCORE_COLORS[score] || '#666',
                              }}>{score}</span>
                            )}
                          </button>
                        );
                      })}
                      {dayEntries.length > 6 && (
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
                          +{dayEntries.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Detail panel overlay */}
      {selectedEntry && (
        <>
          <div onClick={() => setSelectedEntry(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99,
          }} />
          <EntryDetail entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        </>
      )}
    </div>
  );
}

function FilterPill({ label, active, onClick, color }: {
  label: string; active: boolean; onClick: () => void; color?: string;
}) {
  return (
    <button onClick={onClick} style={{
      padding: '3px 10px', borderRadius: 16, fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.04em',
      background: active ? (color ? `${color}22` : 'rgba(255,255,255,0.1)') : 'transparent',
      color: active ? (color || '#fff') : 'rgba(255,255,255,0.3)',
      border: `1px solid ${active ? (color ? `${color}44` : 'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.06)'}`,
      transition: 'all 150ms',
    }}>{label}</button>
  );
}
