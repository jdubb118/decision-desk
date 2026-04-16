import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBrand } from '../App';
import { agents, colors } from '../theme';

interface LearningRecord {
  id: string;
  agent_id: string;
  pattern_type: string;
  pattern: string;
  agent_instruction: string;
  evidence_count: number;
  priority: 'high' | 'medium' | 'low';
  first_seen: string;
  last_updated: string;
}

interface AgentStat {
  agent_id: string;
  total: number;
  approved: number;
  denied: number;
  pending: number;
}

interface DecisionEntry {
  id: string;
  verdict: string;
  title: string;
  agent_id: string;
  type: string;
  notes: string | null;
  denial_tags: string | null;
  created_at: string;
}

interface TasteEntry {
  tag: string;
  count: number;
}

interface VelocityDay {
  day: string;
  count: number;
}

interface IntelData {
  learnings: LearningRecord[];
  agent_stats: AgentStat[];
  velocity: VelocityDay[];
  taste_profile: TasteEntry[];
  recent_decisions: DecisionEntry[];
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function IntelligencePage() {
  const { brand } = useBrand();
  const [data, setData] = useState<IntelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`/api/intelligence?brand=${brand}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [brand]);

  const learnings = data?.learnings || [];
  const positive = learnings.filter(p => p.pattern_type === 'positive');
  const negative = learnings.filter(p => p.pattern_type === 'negative' || p.pattern_type === 'negative-note');
  const agentStats = data?.agent_stats || [];
  const tasteProfile = data?.taste_profile || [];
  const recentDecisions = data?.recent_decisions || [];
  const velocity = data?.velocity || [];

  const totalDecisions = recentDecisions.length;
  const approvals = recentDecisions.filter(d => d.verdict === 'approved').length;
  const approvalRate = totalDecisions > 0 ? Math.round((approvals / totalDecisions) * 100) : 0;

  const avgAgentRate = agentStats.reduce((sum, s) => sum + (s.total > 0 ? s.approved / s.total : 0), 0)
    / Math.max(agentStats.length, 1) * 100;

  const domains = [
    { label: 'Creative\nStandards', short: 'CREATIVE STANDARDS', pct: Math.min(positive.length * 12, 100) },
    { label: "Jeff's\nVoice", short: "JEFF'S VOICE", pct: Math.min(negative.length * 9, 100) },
    { label: 'Team\nCalibration', short: 'TEAM CALIBRATION', pct: Math.round(avgAgentRate) },
    { label: 'Decision\nVelocity', short: 'DECISION VELOCITY', pct: Math.min(velocity.length * 14, 100) },
    { label: 'Taste\nProfile', short: 'TASTE PROFILE', pct: Math.min(tasteProfile.length * 10, 100) },
  ];

  const calibration = Math.min(Math.round(totalDecisions * 0.9 + (positive.length + negative.length) * 2), 100);

  if (loading) {
    return (
      <div style={{ height: 'calc(100vh - 52px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a14' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--brand-accent)', borderRadius: '50%', marginRight: 10 }} />
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>Loading intelligence...</span>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial" animate="animate" exit="exit"
      transition={{ duration: 0.2 }}
      style={{ height: 'calc(100vh - 52px)', overflow: 'auto', padding: 24, background: '#0a0a14' }}
    >
      <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-accent)', flexShrink: 0 }}
              />
              <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, margin: 0, color: '#e0e0e0' }}>
                The {brand.toUpperCase()} Brain
              </h1>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 0 15px' }}>
              A living map of what the system has learned. Grows with every decision.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'decisions', value: totalDecisions },
              { label: 'approval', value: totalDecisions > 0 ? `${approvalRate}%` : '—', color: approvalRate >= 70 ? colors.approve : approvalRate >= 40 ? colors.discuss : undefined },
              { label: 'patterns', value: positive.length + negative.length, color: 'var(--brand-accent)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: (color as string) || '#e0e0e0', fontFamily: "'Bricolage Grotesque', sans-serif", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar + Domain Bars */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18 }}>
          <Card>
            <CardHeader>Knowledge Map</CardHeader>
            <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center' }}>
              <BrainRadar domains={domains} />
            </div>
          </Card>

          <Card>
            <CardHeader>Knowledge Domains</CardHeader>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {domains.map((d, i) => {
                const locked = d.pct === 0;
                const statusLabel = locked ? 'LOCKED' : d.pct < 35 ? 'LEARNING' : d.pct < 70 ? 'BUILDING' : 'ACTIVE';
                const statusColor = locked ? 'rgba(255,255,255,0.2)' : d.pct < 35 ? colors.discuss : colors.approve;
                return (
                  <div key={i} style={{ opacity: locked ? 0.4 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)' }}>{d.short}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', color: statusColor }}>{statusLabel}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, fontFamily: "'JetBrains Mono', monospace", minWidth: 30, textAlign: 'right' }}>{d.pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      {d.pct > 0 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${d.pct}%` }}
                          transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.08 }}
                          style={{ height: '100%', background: 'var(--brand-accent)', borderRadius: 3 }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Calibration */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginTop: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Overall Calibration</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand-accent)', fontFamily: "'JetBrains Mono', monospace" }}>{calibration}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${calibration}%` }} transition={{ duration: 1.1, ease: 'easeOut' }} style={{ height: '100%', background: 'var(--brand-accent)', borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Taste Profile (top denial tags) */}
        {tasteProfile.length > 0 && (
          <Card>
            <CardHeader>Your Taste</CardHeader>
            <div style={{ padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tasteProfile.map((t, i) => (
                <span key={i} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 20,
                  background: `${colors.deny}12`, color: colors.deny,
                  border: `1px solid ${colors.deny}25`, fontWeight: 600,
                }}>
                  {t.tag.replace(/-/g, ' ')} <span style={{ opacity: 0.6 }}>×{t.count}</span>
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Patterns + Standards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Card>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Label>What Gets Approved</Label>
              {positive.length > 0 && <Badge color={colors.approve}>{positive.length}</Badge>}
            </div>
            <div style={{ padding: 12 }}>
              {positive.length === 0 ? (
                <EmptyMsg>Approve content to start building patterns.</EmptyMsg>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {positive.slice(0, 8).map(p => <PatternRow key={p.id} record={p} />)}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Label>Your Standards</Label>
              {negative.length > 0 && <Badge color={colors.deny}>{negative.length}</Badge>}
            </div>
            <div style={{ padding: 12 }}>
              {negative.length === 0 ? (
                <EmptyMsg>Denial feedback will appear here.</EmptyMsg>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {negative.slice(0, 8).map(p => <PatternRow key={p.id} record={p} />)}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Team + Decision Log */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Card>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Label>Team Calibration</Label>
              {agentStats.length > 0 && <Badge>{agentStats.length} agents</Badge>}
            </div>
            <div style={{ padding: 12 }}>
              {agentStats.length === 0 ? (
                <EmptyMsg>No agent activity yet.</EmptyMsg>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...agentStats]
                    .sort((a, b) => (b.total > 0 ? b.approved / b.total : 0) - (a.total > 0 ? a.approved / a.total : 0))
                    .map((stat, idx) => {
                      const agent = agents[stat.agent_id];
                      const rate = stat.total > 0 ? Math.round((stat.approved / stat.total) * 100) : 0;
                      const rateColor = rate >= 70 ? colors.approve : rate >= 40 ? colors.discuss : colors.deny;
                      return (
                        <div key={stat.agent_id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <AgentAvatar agentId={stat.agent_id} size={30} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>{agent?.label || stat.agent_id}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: rateColor, fontFamily: "'JetBrains Mono', monospace" }}>{rate}%</span>
                            </div>
                            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${rate}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.07 }}
                                style={{ height: '100%', background: rateColor, borderRadius: 2 }}
                              />
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{stat.total}d</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Label>Recent Decisions</Label>
              {totalDecisions > 0 && <Badge>{totalDecisions} total</Badge>}
            </div>
            <div style={{ padding: 10, maxHeight: 300, overflowY: 'auto' }}>
              {recentDecisions.length === 0 ? (
                <EmptyMsg>Decisions will appear here as you review work.</EmptyMsg>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {recentDecisions.map(d => {
                    const agent = agents[d.agent_id];
                    const verdictColor = d.verdict === 'approved' ? colors.approve : d.verdict === 'denied' ? colors.deny : colors.discuss;
                    return (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 4px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: verdictColor, flexShrink: 0, marginTop: 5 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#e0e0e0', lineHeight: 1.3 }}>{d.title}</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                            {agent?.label || d.agent_id} · {d.type?.replace(/-/g, ' ')}
                          </div>
                          {d.notes && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginTop: 2 }}>"{d.notes}"</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

// ── Radar SVG ──
function BrainRadar({ domains }: { domains: { label: string; pct: number }[] }) {
  const cx = 130, cy = 125, r = 90;
  const n = domains.length;

  function pt(i: number, radius: number) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  }

  function poly(points: { x: number; y: number }[]) {
    return points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }

  const outer = Array.from({ length: n }, (_, i) => pt(i, r));
  const filled = Array.from({ length: n }, (_, i) => pt(i, Math.max(r * (domains[i].pct / 100), 3)));

  return (
    <svg viewBox="0 0 260 250" width={240} height={230} style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1.0].map(lvl => (
        <polygon key={lvl} points={poly(Array.from({ length: n }, (_, i) => pt(i, r * lvl)))} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      {outer.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      <motion.polygon
        points={poly(filled)}
        fill="var(--brand-accent)"
        fillOpacity={0.15}
        stroke="var(--brand-accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      {filled.map((p, i) => domains[i].pct > 0 && (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--brand-accent)" />
      ))}
      {domains.map((d, i) => {
        const lp = pt(i, r + 24);
        const anchor = lp.x > cx + 10 ? 'start' : lp.x < cx - 10 ? 'end' : 'middle';
        const lines = d.label.split('\n');
        const muted = d.pct === 0;
        return (
          <text key={i} textAnchor={anchor} fill={muted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)'} fontSize={9} fontWeight={muted ? 400 : 700} fontFamily="DM Sans, sans-serif" letterSpacing="0.04em">
            {lines.map((line, li) => (
              <tspan key={li} x={lp.x.toFixed(1)} dy={li === 0 ? `${lp.y.toFixed(1)}` : '1.2em'} dominantBaseline={li === 0 ? 'middle' : 'auto'}>
                {line.toUpperCase()}
              </tspan>
            ))}
          </text>
        );
      })}
      <circle cx={cx} cy={cy} r={2} fill="var(--brand-accent)" opacity={0.6} />
    </svg>
  );
}

// ── Shared Components ──
function PatternRow({ record }: { record: LearningRecord }) {
  const isPos = record.pattern_type === 'positive';
  const accent = isPos ? colors.approve : colors.deny;
  const dot = record.priority === 'high' ? '●' : record.priority === 'medium' ? '◉' : '○';

  const label = record.pattern
    .replace(/_/g, ' ').replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Jeff Note \w+/, "Jeff's Note");

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 7,
      padding: '7px 10px', borderRadius: 8,
      background: `${accent}08`,
      borderLeft: `3px solid ${accent}40`,
    }}>
      <span style={{ fontSize: 10, color: accent, marginTop: 2, flexShrink: 0 }}>{dot}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e0', lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.4, marginTop: 1 }}>{record.agent_instruction}</div>
      </div>
      <span style={{ fontSize: 10, color: accent, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
        {record.evidence_count}×
      </span>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>{children}</div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <Label>{children}</Label>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
      {children}
    </span>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
      color: color || 'rgba(255,255,255,0.25)',
      background: color ? `${color}12` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${color ? `${color}25` : 'rgba(255,255,255,0.06)'}`,
      padding: '1px 6px', borderRadius: 3,
    }}>{children}</span>
  );
}

function EmptyMsg({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '20px 0', textAlign: 'center' }}>
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brand-accent)', margin: '0 auto 8px' }}
      />
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0, lineHeight: 1.5 }}>{children}</p>
    </div>
  );
}

function AgentAvatar({ agentId, size = 26 }: { agentId: string; size?: number }) {
  const agent = agents[agentId];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${agent?.color || '#999'}20`,
      border: `2px solid ${agent?.color || '#999'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 700, color: agent?.color || '#999', flexShrink: 0,
    }}>
      {(agent?.label || agentId)[0].toUpperCase()}
    </div>
  );
}
