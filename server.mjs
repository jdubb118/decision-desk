import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Config resolution
// ---------------------------------------------------------------------------
// Priority: env var > config.json > built-in default. Env wins so people can
// override any field via DECISION_DESK_* without editing config.json.

const CONFIG_PATH = process.env.DECISION_DESK_CONFIG || join(__dirname, 'config.json');

function loadConfigFile() {
  if (!existsSync(CONFIG_PATH)) return {};
  try { return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')); }
  catch (err) {
    console.error(`Invalid config.json at ${CONFIG_PATH}:`, err.message);
    return {};
  }
}

const fileConfig = loadConfigFile();

function pickEnv(envKey, fileVal, fallback) {
  if (process.env[envKey] !== undefined && process.env[envKey] !== '') return process.env[envKey];
  if (fileVal !== undefined && fileVal !== null) return fileVal;
  return fallback;
}

const PORT = Number(pickEnv('PORT', fileConfig.port, 3335));
const HOST = pickEnv('HOST', fileConfig.host, '127.0.0.1');
const DATA_DIR = resolve(pickEnv('DECISION_DESK_DATA_DIR', fileConfig.data_dir, join(__dirname, 'data')));
const DB_PATH = pickEnv('DECISION_DESK_DB', fileConfig.database_path, join(DATA_DIR, 'decision-desk.db'));
const REVIEWER = pickEnv('DECISION_DESK_REVIEWER', fileConfig.reviewer, 'reviewer');
const BRAND_CONTEXT_DIR = pickEnv('DECISION_DESK_BRAND_CONTEXT_DIR', fileConfig.brand_context_dir, join(DATA_DIR, 'brand-context'));
const SAFE_ROOTS = (pickEnv(
  'DECISION_DESK_SAFE_ROOTS',
  Array.isArray(fileConfig.safe_roots) ? fileConfig.safe_roots.join(':') : fileConfig.safe_roots,
  join(DATA_DIR, 'uploads'),
)).split(':').map(p => p.endsWith('/') ? p : p + '/');
const NOTIFY_WEBHOOK_URL = pickEnv('DECISION_DESK_WEBHOOK_URL', fileConfig.notifications?.webhook_url, null) || null;
const NOTIFY_WEBHOOK_SECRET = pickEnv('DECISION_DESK_WEBHOOK_SECRET', fileConfig.notifications?.webhook_secret, null) || null;

// Brands: array of { id, label, color, ... }. Frontend mockups consume this
// via /api/config. If unspecified, the desk runs single-tenant with one
// "default" brand and the toggle stays hidden.
const BRANDS = (() => {
  if (Array.isArray(fileConfig.brands) && fileConfig.brands.length > 0) {
    return fileConfig.brands.map(b => ({
      id: String(b.id),
      label: String(b.label || b.id),
      color: String(b.color || '#6366f1'),
      domain: b.domain ? String(b.domain) : null,
      handle: b.handle ? String(b.handle) : null,
      founder_name: b.founder_name ? String(b.founder_name) : null,
      founder_headline: b.founder_headline ? String(b.founder_headline) : null,
      context_path: b.context_path ? String(b.context_path) : null,
    }));
  }
  return [{ id: 'default', label: 'Default', color: '#6366f1', domain: null, handle: null, founder_name: null, founder_headline: null, context_path: null }];
})();

const CARD_TYPES = Array.isArray(fileConfig.card_types) ? fileConfig.card_types : null;

mkdirSync(DATA_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function uid() {
  return crypto.randomBytes(9).toString('base64url').slice(0, 12);
}

function now() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    brand TEXT,
    module TEXT,
    title TEXT,
    stage TEXT DEFAULT 'briefed',
    created_by TEXT,
    created_at TEXT,
    updated_at TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS deliverables (
    id TEXT PRIMARY KEY,
    campaign_id TEXT,
    agent_id TEXT,
    type TEXT,
    title TEXT,
    version INTEGER DEFAULT 1,
    html_content TEXT,
    status TEXT DEFAULT 'submitted',
    subject_line TEXT,
    metadata TEXT,
    validation_status TEXT,
    validation_results TEXT,
    submitted_at TEXT,
    decided_at TEXT
  );

  CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    deliverable_id TEXT,
    campaign_id TEXT,
    decider TEXT DEFAULT 'reviewer',
    verdict TEXT,
    denial_tags TEXT,
    notes TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS learning_records (
    id TEXT PRIMARY KEY,
    source_decision_id TEXT,
    agent_id TEXT,
    module TEXT,
    brand TEXT,
    pattern_type TEXT,
    pattern TEXT,
    agent_instruction TEXT,
    evidence_count INTEGER DEFAULT 1,
    priority TEXT DEFAULT 'low',
    active INTEGER DEFAULT 1,
    first_seen TEXT,
    last_updated TEXT
  );

  CREATE TABLE IF NOT EXISTS discussion_messages (
    id TEXT PRIMARY KEY,
    deliverable_id TEXT,
    campaign_id TEXT,
    author TEXT,
    body TEXT,
    created_at TEXT,
    parent_id TEXT
  );

  CREATE TABLE IF NOT EXISTS calendar_entries (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    date TEXT NOT NULL,
    channel TEXT,
    sub_channel TEXT,
    campaign_name TEXT,
    campaign_month TEXT,
    concept TEXT,
    why_hook TEXT,
    content_split TEXT,
    product_json TEXT,
    copy_direction TEXT,
    final_copy TEXT,
    asset_json TEXT,
    status TEXT DEFAULT 'draft',
    paid_note TEXT,
    b2b_variant TEXT,
    tags_json TEXT,
    notes TEXT,
    posted_at TEXT,
    platform_draft_id TEXT,
    staged_at TEXT,
    performance_json TEXT,
    tier TEXT DEFAULT 'horizon',
    imported_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS calendar_flags (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    agent_id TEXT,
    flag_type TEXT NOT NULL,
    note TEXT,
    created_at TEXT,
    resolved_at TEXT,
    FOREIGN KEY (entry_id) REFERENCES calendar_entries(id)
  );

  CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);
  CREATE INDEX IF NOT EXISTS idx_deliverables_campaign ON deliverables(campaign_id);
  CREATE INDEX IF NOT EXISTS idx_deliverables_status_submitted ON deliverables(status, submitted_at);
  CREATE INDEX IF NOT EXISTS idx_decisions_deliverable ON decisions(deliverable_id);
  CREATE INDEX IF NOT EXISTS idx_decisions_campaign ON decisions(campaign_id);
  CREATE INDEX IF NOT EXISTS idx_decisions_created ON decisions(created_at);
  CREATE INDEX IF NOT EXISTS idx_learning_agent_brand ON learning_records(agent_id, brand);
  CREATE INDEX IF NOT EXISTS idx_discussion_deliverable ON discussion_messages(deliverable_id);
  CREATE INDEX IF NOT EXISTS idx_discussion_campaign ON discussion_messages(campaign_id);
  CREATE INDEX IF NOT EXISTS idx_discussion_parent ON discussion_messages(parent_id);
  CREATE INDEX IF NOT EXISTS idx_calendar_brand_date ON calendar_entries(brand, date);
  CREATE INDEX IF NOT EXISTS idx_calendar_channel ON calendar_entries(channel);
  CREATE INDEX IF NOT EXISTS idx_calendar_status ON calendar_entries(status);
  CREATE INDEX IF NOT EXISTS idx_calendar_tier ON calendar_entries(tier);
  CREATE INDEX IF NOT EXISTS idx_calendar_flags_entry ON calendar_flags(entry_id);
`);

// Drop the misnamed old index from pre-audit schemas (it aliased to campaign_id, not brand).
try { db.exec(`DROP INDEX IF EXISTS idx_deliverables_brand`); } catch { /* noop */ }

// Closure-loop columns — track what happened AFTER the reviewer approved.
// SQLite's ALTER TABLE is additive-only; we guard with column introspection.
function ensureColumn(table, column, ddl) {
  const info = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!info.some(c => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  }
}
ensureColumn('deliverables', 'executed_at', 'TEXT');
ensureColumn('deliverables', 'executed_by', 'TEXT');
ensureColumn('deliverables', 'execution_status', `TEXT`);
ensureColumn('deliverables', 'execution_notes', 'TEXT');
ensureColumn('deliverables', 'probation_entry_id', 'TEXT');

db.exec(`CREATE INDEX IF NOT EXISTS idx_deliverables_execution ON deliverables(status, execution_status)`);

// ---------------------------------------------------------------------------
// Prepared statements
// ---------------------------------------------------------------------------

const stmts = {
  insertCampaign: db.prepare(`
    INSERT INTO campaigns (id, brand, module, title, stage, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'briefed', ?, ?, ?)
  `),
  insertDeliverable: db.prepare(`
    INSERT INTO deliverables (id, campaign_id, agent_id, type, title, version, html_content, status, subject_line, metadata, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?)
  `),
  getDeliverableById: db.prepare(`SELECT * FROM deliverables WHERE id = ?`),
  getCampaignById: db.prepare(`SELECT * FROM campaigns WHERE id = ?`),
  updateDeliverableStatus: db.prepare(`UPDATE deliverables SET status = ?, decided_at = ? WHERE id = ?`),
  bumpDeliverableVersion: db.prepare(`UPDATE deliverables SET version = version + 1 WHERE id = ?`),
  insertDecision: db.prepare(`
    INSERT INTO decisions (id, deliverable_id, campaign_id, decider, verdict, denial_tags, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  insertLearning: db.prepare(`
    INSERT INTO learning_records (id, source_decision_id, agent_id, module, brand, pattern_type, pattern, agent_instruction, evidence_count, priority, active, first_seen, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'low', 1, ?, ?)
  `),
  findLearning: db.prepare(`
    SELECT * FROM learning_records WHERE agent_id = ? AND brand = ? AND pattern = ? AND active = 1
  `),
  updateLearningEvidence: db.prepare(`
    UPDATE learning_records SET evidence_count = evidence_count + 1, last_updated = ?,
    priority = CASE WHEN evidence_count + 1 >= 4 THEN 'high' WHEN evidence_count + 1 >= 2 THEN 'medium' ELSE 'low' END
    WHERE id = ?
  `),
  insertDiscussion: db.prepare(`
    INSERT INTO discussion_messages (id, deliverable_id, campaign_id, author, body, created_at, parent_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  getDiscussion: db.prepare(`
    SELECT * FROM discussion_messages WHERE deliverable_id = ? ORDER BY created_at ASC
  `),
};

// ---------------------------------------------------------------------------
// Learning extraction
// ---------------------------------------------------------------------------

function extractLearning(decision, deliverable) {
  const ts = now();
  const brand = null; // resolved below
  const agent_id = deliverable.agent_id;
  const module = deliverable.type;

  // Resolve brand from campaign
  const campaign = deliverable.campaign_id ? stmts.getCampaignById.get(deliverable.campaign_id) : null;
  const brandName = campaign?.brand || 'unknown';

  if (decision.verdict === 'denied' && decision.denial_tags) {
    const tags = typeof decision.denial_tags === 'string'
      ? decision.denial_tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    for (const tag of tags) {
      const existing = stmts.findLearning.get(agent_id, brandName, tag);
      if (existing) {
        stmts.updateLearningEvidence.run(ts, existing.id);
      } else {
        const instruction = `Avoid: ${tag}`;
        stmts.insertLearning.run(uid(), decision.id, agent_id, module, brandName, 'negative', tag, instruction, ts, ts);
      }
    }

    // Store notes as high-priority learning if present
    if (decision.notes && decision.notes.trim()) {
      const notePattern = `denial-note:${decision.id}`;
      stmts.insertLearning.run(
        uid(), decision.id, agent_id, module, brandName,
        'negative-note', notePattern, decision.notes.trim(), ts, ts
      );
      // Immediately set high priority for notes
      const inserted = stmts.findLearning.get(agent_id, brandName, notePattern);
      if (inserted) {
        db.prepare(`UPDATE learning_records SET priority = 'high' WHERE id = ?`).run(inserted.id);
      }
    }
  }

  if (decision.verdict === 'approved') {
    const pattern = `approved:${deliverable.type}:${deliverable.title}`;
    const existing = stmts.findLearning.get(agent_id, brandName, pattern);
    if (existing) {
      stmts.updateLearningEvidence.run(ts, existing.id);
    } else {
      stmts.insertLearning.run(uid(), decision.id, agent_id, module, brandName, 'positive', pattern, 'Approved pattern', ts, ts);
    }
  }
}

// ---------------------------------------------------------------------------
// Brand context parser
// ---------------------------------------------------------------------------
// Reads optional `<brand>-context.md` files from BRAND_CONTEXT_DIR and parses
// canonical sections (positioning / competitors / edges / targets / gaps).
// Returns null if no file exists — brand context is optional.

function parseBrandContext(brand) {
  if (!brand) return null;
  // Per-brand context_path in config wins; else fall back to BRAND_CONTEXT_DIR/<brand>-context.md
  const brandCfg = BRANDS.find(b => b.id === brand);
  const filePath = brandCfg?.context_path
    ? resolve(brandCfg.context_path)
    : join(BRAND_CONTEXT_DIR, `${brand}-context.md`);

  if (!existsSync(filePath)) return null;

  const raw = readFileSync(filePath, 'utf-8');
  const sections = {};
  const sectionNames = ['positioning', 'competitors', 'edges', 'targets', 'gaps'];

  for (const name of sectionNames) {
    const regex = new RegExp(`##\\s*${name}[\\s\\S]*?(?=\\n##|$)`, 'i');
    const match = raw.match(regex);
    sections[name] = match ? match[0].replace(/^##\s*\S+\s*/i, '').trim() : null;
  }

  return { brand, file: filePath, sections, raw_length: raw.length };
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
// CORS is only needed because Vite dev server runs on :5173 and calls back to :3335.
// Production serves the bundle from this same origin, so no CORS needed there.
// Localhost-only origins — never wildcard.
app.use(cors({
  origin: [
    'http://localhost:3335',
    'http://localhost:5173',
    'http://127.0.0.1:3335',
    'http://127.0.0.1:5173',
  ],
}));
app.use(express.json({ limit: '5mb' }));

// Static files for React frontend
const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Public config — frontend fetches this once at boot to learn the brand list,
// theme, and any other UI-relevant settings. Never exposes secrets or paths.
app.get('/api/config', (_req, res) => {
  res.json({
    brands: BRANDS.map(b => ({
      id: b.id,
      label: b.label,
      color: b.color,
      domain: b.domain,
      handle: b.handle,
      founder_name: b.founder_name,
      founder_headline: b.founder_headline,
    })),
    card_types: CARD_TYPES,
    calendar_enabled: Object.keys(CALENDAR_PATHS).length > 0,
    webhook_configured: !!NOTIFY_WEBHOOK_URL,
  });
});

// Health
app.get('/api/health', (_req, res) => {
  const counts = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM deliverables) as deliverables,
      (SELECT COUNT(*) FROM deliverables WHERE status = 'submitted') as pending,
      (SELECT COUNT(*) FROM decisions) as decisions,
      (SELECT COUNT(*) FROM learning_records WHERE active = 1) as learning_records,
      (SELECT COUNT(*) FROM campaigns) as campaigns,
      (SELECT COUNT(*) FROM calendar_entries) as calendar_entries
  `).get();
  res.json({ status: 'ok', port: PORT, counts });
});

// Submit deliverable
app.post('/api/submit', (req, res) => {
  try {
    const { type, brand, agent_id, title, html_content, subject_line, metadata, campaign_id } = req.body;
    if (!type || !title || !html_content) {
      return res.status(400).json({ error: 'type, title, and html_content are required' });
    }

    const ts = now();
    let cid = campaign_id;

    // Auto-create campaign if none provided
    if (!cid) {
      cid = uid();
      stmts.insertCampaign.run(cid, brand || null, type, title, agent_id || null, ts, ts);
    }

    // Check for existing version (resubmission)
    const existing = db.prepare(`
      SELECT MAX(version) as maxVer FROM deliverables WHERE campaign_id = ? AND agent_id = ? AND type = ?
    `).get(cid, agent_id || null, type);
    const version = existing?.maxVer ? existing.maxVer + 1 : 1;

    const did = uid();
    const metaStr = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;

    stmts.insertDeliverable.run(did, cid, agent_id || null, type, title, version, html_content, subject_line || null, metaStr, ts);

    res.json({ id: did, campaign_id: cid, version, status: 'submitted' });
  } catch (err) {
    console.error('POST /api/submit error:', err.message);
    res.status(500).json({ error: 'Internal error. Check server log for details.' });
  }
});

// Get pending queue
app.get('/api/queue', (req, res) => {
  const { brand } = req.query;
  let sql = `
    SELECT d.*, c.brand, c.module as campaign_module
    FROM deliverables d
    LEFT JOIN campaigns c ON d.campaign_id = c.id
    WHERE d.status = 'submitted'
  `;
  const params = [];
  if (brand) {
    sql += ` AND c.brand = ?`;
    params.push(brand);
  }
  sql += ` ORDER BY d.submitted_at DESC`;

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// Get all deliverables with filters.
// `executed` filter is tri-state: 'true' = executed, 'false' = not executed, unset = both.
app.get('/api/deliverables', (req, res) => {
  const { status, brand, type, agent_id, executed } = req.query;
  let sql = `
    SELECT d.*, c.brand, c.module as campaign_module
    FROM deliverables d
    LEFT JOIN campaigns c ON d.campaign_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (status) { sql += ` AND d.status = ?`; params.push(status); }
  if (brand) { sql += ` AND c.brand = ?`; params.push(brand); }
  if (type) { sql += ` AND d.type = ?`; params.push(type); }
  if (agent_id) { sql += ` AND d.agent_id = ?`; params.push(agent_id); }
  if (executed === 'true') { sql += ` AND d.executed_at IS NOT NULL`; }
  if (executed === 'false') { sql += ` AND d.executed_at IS NULL`; }
  sql += ` ORDER BY d.submitted_at DESC`;

  res.json(db.prepare(sql).all(...params));
});

// Card context — rich context for decision-making
app.get('/api/card-context/:id', (req, res) => {
  const deliverable = stmts.getDeliverableById.get(req.params.id);
  if (!deliverable) return res.status(404).json({ error: 'Not found' });

  // Prior denials for this agent
  const priorDenials = db.prepare(`
    SELECT dec.*, d.title, d.type
    FROM decisions dec
    JOIN deliverables d ON dec.deliverable_id = d.id
    WHERE d.agent_id = ? AND dec.verdict = 'denied'
    ORDER BY dec.created_at DESC LIMIT 10
  `).all(deliverable.agent_id || '');

  // Approval history for this agent
  const approvalHistory = db.prepare(`
    SELECT dec.*, d.title, d.type
    FROM decisions dec
    JOIN deliverables d ON dec.deliverable_id = d.id
    WHERE d.agent_id = ?
    ORDER BY dec.created_at DESC LIMIT 20
  `).all(deliverable.agent_id || '');

  // Discussion thread
  const discussion = stmts.getDiscussion.all(deliverable.id);

  // Learning patterns for this agent+brand
  const campaign = deliverable.campaign_id ? stmts.getCampaignById.get(deliverable.campaign_id) : null;
  const learnings = db.prepare(`
    SELECT * FROM learning_records
    WHERE agent_id = ? AND (brand = ? OR brand = 'unknown') AND active = 1
    ORDER BY priority DESC, evidence_count DESC LIMIT 20
  `).all(deliverable.agent_id || '', campaign?.brand || 'unknown');

  res.json({
    deliverable,
    campaign,
    prior_denials: priorDenials,
    approval_history: approvalHistory,
    discussion,
    learnings,
  });
});

// Full deliverable detail
app.get('/api/deliverable/:id', (req, res) => {
  const deliverable = stmts.getDeliverableById.get(req.params.id);
  if (!deliverable) return res.status(404).json({ error: 'Not found' });

  const discussion = stmts.getDiscussion.all(deliverable.id);
  const decisions = db.prepare(`SELECT * FROM decisions WHERE deliverable_id = ? ORDER BY created_at DESC`).all(deliverable.id);
  const campaign = deliverable.campaign_id ? stmts.getCampaignById.get(deliverable.campaign_id) : null;

  res.json({ ...deliverable, campaign, discussion, decisions });
});

// Fire-and-forget webhook notifier. POSTs verdict events to NOTIFY_WEBHOOK_URL
// when configured; signs the body with HMAC-SHA256 if NOTIFY_WEBHOOK_SECRET set.
// No-op when the env var is empty — keeps the OSS default zero-config.
function notifyDownstream(event) {
  if (!NOTIFY_WEBHOOK_URL) return;
  const payload = JSON.stringify({ ...event, timestamp: now() });
  const headers = { 'Content-Type': 'application/json' };
  if (NOTIFY_WEBHOOK_SECRET) {
    headers['X-DecisionDesk-Signature'] =
      'sha256=' + crypto.createHmac('sha256', NOTIFY_WEBHOOK_SECRET).update(payload).digest('hex');
  }
  fetch(NOTIFY_WEBHOOK_URL, { method: 'POST', headers, body: payload })
    .catch(err => console.error('notifyDownstream failed:', err.message));
}

// Map frontend verdict vocabulary (action semantics) to canonical DB verdicts.
// ActionBar emits context-specific verbs — normalize here so the server has one whitelist.
const VERDICT_MAP = {
  approved: 'approved',
  advance: 'approved',          // performance-update approve
  act: 'approved',               // recommendation / research-summary approve
  answered: 'approved',          // question type (with notes)
  denied: 'denied',
  kill: 'denied',                // performance-update deny
  pass: 'denied',                // recommendation / influencer-proposal deny
  revision_requested: 'revision_requested',
};

// Record a decision
// Accept both /api/decide (legacy) and /api/decision (used by frontend) — they're aliases.
app.post(['/api/decide', '/api/decision'], (req, res) => {
  try {
    const { deliverable_id, verdict: rawVerdict, denial_tags, notes } = req.body;
    if (!deliverable_id || !rawVerdict) {
      return res.status(400).json({ error: 'deliverable_id and verdict are required' });
    }
    const verdict = VERDICT_MAP[rawVerdict];
    if (!verdict) {
      return res.status(400).json({ error: `unknown verdict: ${rawVerdict}. Expected one of: ${Object.keys(VERDICT_MAP).join(', ')}` });
    }

    const deliverable = stmts.getDeliverableById.get(deliverable_id);
    if (!deliverable) return res.status(404).json({ error: 'Deliverable not found' });

    const ts = now();
    const decisionId = uid();
    const tagsStr = Array.isArray(denial_tags) ? denial_tags.join(',') : (denial_tags || null);

    stmts.insertDecision.run(decisionId, deliverable_id, deliverable.campaign_id, REVIEWER, verdict, tagsStr, notes || null, ts);

    // Update deliverable status
    const newStatus = verdict === 'approved' ? 'approved' : verdict === 'denied' ? 'denied' : 'revision_requested';
    stmts.updateDeliverableStatus.run(newStatus, ts, deliverable_id);

    // Extract learning
    const decision = { id: decisionId, verdict, denial_tags: tagsStr, notes };
    extractLearning(decision, deliverable);

    // Webhook notify (no-op if NOTIFY_WEBHOOK_URL not set)
    notifyDownstream({
      event: 'decision',
      card: { id: deliverable.id, type: deliverable.type, title: deliverable.title, agent_id: deliverable.agent_id },
      verdict,
      raw_verdict: rawVerdict,
      notes: notes || null,
    });

    res.json({ id: decisionId, deliverable_id, verdict, raw_verdict: rawVerdict, status: newStatus });
  } catch (err) {
    console.error('POST /api/decide error:', err.message);
    res.status(500).json({ error: 'Internal error recording decision' });
  }
});

// Record that a deliverable has been executed (closes the loop: submit → approve → execute).
app.post('/api/deliverables/:id/executed', (req, res) => {
  try {
    const { executed_by, execution_status = 'completed', execution_notes } = req.body;
    if (!executed_by) return res.status(400).json({ error: 'executed_by is required' });
    if (!['completed', 'failed', 'partial'].includes(execution_status)) {
      return res.status(400).json({ error: 'execution_status must be completed, failed, or partial' });
    }

    const deliverable = stmts.getDeliverableById.get(req.params.id);
    if (!deliverable) return res.status(404).json({ error: 'Not found' });
    if (deliverable.status !== 'approved') {
      return res.status(409).json({ error: `Deliverable is ${deliverable.status}, can only execute approved items` });
    }
    if (deliverable.executed_at) {
      return res.status(409).json({ error: 'Already executed', executed_at: deliverable.executed_at });
    }

    const ts = now();
    db.prepare(`
      UPDATE deliverables
      SET executed_at = ?, executed_by = ?, execution_status = ?, execution_notes = ?
      WHERE id = ?
    `).run(ts, executed_by, execution_status, execution_notes || null, req.params.id);

    notifyDownstream({
      event: 'executed',
      card: { id: deliverable.id, type: deliverable.type, title: deliverable.title, agent_id: deliverable.agent_id },
      executed_by,
      execution_status,
      notes: execution_notes || null,
    });

    res.json({
      id: deliverable.id,
      executed_at: ts,
      executed_by,
      execution_status,
    });
  } catch (err) {
    console.error('POST /api/deliverables/:id/executed error:', err.message);
    res.status(500).json({ error: 'Internal error recording execution' });
  }
});

// Add discussion message
// Frontend sends `message`, older callers send `body` — accept either.
app.post('/api/discuss', (req, res) => {
  try {
    const { deliverable_id, author, parent_id } = req.body;
    const body = req.body.body ?? req.body.message;
    if (!deliverable_id || !author || !body) {
      return res.status(400).json({ error: 'deliverable_id, author, and body (or message) are required' });
    }

    const deliverable = stmts.getDeliverableById.get(deliverable_id);
    if (!deliverable) return res.status(404).json({ error: 'Deliverable not found' });

    const msgId = uid();
    stmts.insertDiscussion.run(msgId, deliverable_id, deliverable.campaign_id, author, body, now(), parent_id || null);

    res.json({ id: msgId, deliverable_id, author });
  } catch (err) {
    console.error('POST /api/discuss error:', err.message);
    res.status(500).json({ error: 'Internal error posting discussion' });
  }
});

// Intelligence page
app.get('/api/intelligence', (req, res) => {
  const { brand } = req.query;

  // Learning patterns
  let learningsSql = `SELECT * FROM learning_records WHERE active = 1`;
  const lParams = [];
  if (brand) { learningsSql += ` AND brand = ?`; lParams.push(brand); }
  learningsSql += ` ORDER BY priority DESC, evidence_count DESC LIMIT 50`;
  const learnings = db.prepare(learningsSql).all(...lParams);

  // Agent stats
  const agentStats = db.prepare(`
    SELECT
      d.agent_id,
      COUNT(*) as total,
      SUM(CASE WHEN d.status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN d.status = 'denied' THEN 1 ELSE 0 END) as denied,
      SUM(CASE WHEN d.status = 'submitted' THEN 1 ELSE 0 END) as pending
    FROM deliverables d
    ${brand ? 'JOIN campaigns c ON d.campaign_id = c.id WHERE c.brand = ?' : 'WHERE 1=1'}
    GROUP BY d.agent_id
  `).all(...(brand ? [brand] : []));

  // Velocity — decisions per day over last 7 days (brand-scoped when ?brand= set)
  const velocity = db.prepare(`
    SELECT DATE(dec.created_at) as day, COUNT(*) as count
    FROM decisions dec
    LEFT JOIN campaigns c ON dec.campaign_id = c.id
    WHERE dec.created_at >= datetime('now', '-7 days')
      ${brand ? 'AND c.brand = ?' : ''}
    GROUP BY DATE(dec.created_at)
    ORDER BY day DESC
  `).all(...(brand ? [brand] : []));

  // Taste profile — top denial tags (brand-scoped when ?brand= set)
  const tasteProfile = db.prepare(`
    SELECT dec.denial_tags FROM decisions dec
    LEFT JOIN campaigns c ON dec.campaign_id = c.id
    WHERE dec.verdict = 'denied' AND dec.denial_tags IS NOT NULL
      ${brand ? 'AND c.brand = ?' : ''}
  `).all(...(brand ? [brand] : []));
  const tagCounts = {};
  for (const row of tasteProfile) {
    for (const tag of row.denial_tags.split(',').map(t => t.trim()).filter(Boolean)) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }));

  // Recent decisions (brand-scoped when ?brand= set — prevents cross-brand bleed-through)
  const recentDecisions = db.prepare(`
    SELECT dec.*, d.title, d.type, d.agent_id, c.brand
    FROM decisions dec
    JOIN deliverables d ON dec.deliverable_id = d.id
    LEFT JOIN campaigns c ON dec.campaign_id = c.id
    ${brand ? 'WHERE c.brand = ?' : ''}
    ORDER BY dec.created_at DESC LIMIT 20
  `).all(...(brand ? [brand] : []));

  res.json({ learnings, agent_stats: agentStats, velocity, taste_profile: topTags, recent_decisions: recentDecisions });
});

// Brand profile
app.get('/api/brand-profile', (req, res) => {
  const { brand } = req.query;
  if (!brand) return res.status(400).json({ error: 'brand query param required' });

  const context = parseBrandContext(brand);
  if (!context) return res.status(404).json({ error: `No context file found for brand: ${brand}` });

  res.json(context);
});

// Morning brief
app.get('/api/morning-brief', (_req, res) => {
  const queueDepth = db.prepare(`SELECT COUNT(*) as count FROM deliverables WHERE status = 'submitted'`).get().count;

  // Stalled: submitted more than 48h ago
  const stalled = db.prepare(`
    SELECT d.id, d.title, d.agent_id, d.type, d.submitted_at, c.brand
    FROM deliverables d
    LEFT JOIN campaigns c ON d.campaign_id = c.id
    WHERE d.status = 'submitted' AND d.submitted_at < datetime('now', '-48 hours')
    ORDER BY d.submitted_at ASC
  `).all();

  // Recent decisions (last 24h)
  const recentDecisions = db.prepare(`
    SELECT dec.verdict, d.title, d.agent_id, c.brand, dec.created_at
    FROM decisions dec
    JOIN deliverables d ON dec.deliverable_id = d.id
    LEFT JOIN campaigns c ON dec.campaign_id = c.id
    WHERE dec.created_at >= datetime('now', '-24 hours')
    ORDER BY dec.created_at DESC
  `).all();

  // Approvals vs denials last 7 days
  const weekStats = db.prepare(`
    SELECT verdict, COUNT(*) as count
    FROM decisions
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY verdict
  `).all();

  res.json({
    queue_depth: queueDepth,
    stalled,
    recent_decisions: recentDecisions,
    week_stats: weekStats,
    generated_at: now(),
  });
});

// Decision history with pagination
app.get('/api/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;

  const rows = db.prepare(`
    SELECT dec.*, d.title, d.type, d.agent_id, d.html_content, c.brand
    FROM decisions dec
    JOIN deliverables d ON dec.deliverable_id = d.id
    LEFT JOIN campaigns c ON dec.campaign_id = c.id
    ORDER BY dec.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM decisions`).get().count;

  res.json({ decisions: rows, total, limit, offset });
});

// Email HTML preview — serves the raw html_content as a page.
// Sandboxed via CSP to neutralise any script tags in agent-submitted HTML.
app.get('/api/preview/:id', (req, res) => {
  const deliverable = stmts.getDeliverableById.get(req.params.id);
  if (!deliverable || !deliverable.html_content) {
    return res.status(404).send('<html><body style="font-family:sans-serif;padding:40px;color:#999;text-align:center">No preview available</body></html>');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' data: https:; script-src 'none'; frame-ancestors 'self'");
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.send(deliverable.html_content);
});

// Session stats — approvals/denials since a given timestamp. Used by empty-state summary.
app.get('/api/session-stats', (req, res) => {
  const since = req.query.since || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const row = db.prepare(`
    SELECT
      SUM(CASE WHEN verdict = 'approved' THEN 1 ELSE 0 END) as approvals,
      SUM(CASE WHEN verdict = 'denied' THEN 1 ELSE 0 END) as denials,
      COUNT(*) as count
    FROM decisions
    WHERE created_at >= ?
  `).get(since);
  res.json({
    since,
    count: row?.count || 0,
    approvals: row?.approvals || 0,
    denials: row?.denials || 0,
  });
});

// Creative asset file — serves binary content pointed to by metadata.content_path.
// Returns 404 (which triggers client-side placeholder) when no path is set.
app.get('/api/file/:id', (req, res) => {
  const deliverable = stmts.getDeliverableById.get(req.params.id);
  if (!deliverable) return res.status(404).json({ error: 'Not found' });

  let contentPath = null;
  try {
    const meta = deliverable.metadata ? JSON.parse(deliverable.metadata) : null;
    contentPath = meta?.content_path || null;
  } catch { /* metadata may not be JSON */ }

  if (!contentPath) return res.status(404).json({ error: 'No content file for this deliverable' });

  // Security: only allow absolute paths under configured safe roots so a poisoned
  // metadata record can't read arbitrary files from disk. Configure via
  // DECISION_DESK_SAFE_ROOTS (colon-separated list, defaults to ./data/uploads).
  if (!SAFE_ROOTS.some(root => contentPath.startsWith(root))) {
    console.warn(`/api/file/${req.params.id} blocked path outside safe roots: ${contentPath}`);
    return res.status(403).json({ error: 'Path not allowed' });
  }
  if (!existsSync(contentPath)) return res.status(404).json({ error: 'File not found on disk' });

  res.sendFile(contentPath);
});

// ---------------------------------------------------------------------------
// Calendar API
// ---------------------------------------------------------------------------
// Calendar import paths come from config.json `calendar.import_paths` or env
// DECISION_DESK_CALENDAR_PATHS (JSON map of brand → file path). Env overrides
// config. Empty by default — calendar import is opt-in.

const CALENDAR_PATHS = (() => {
  const envRaw = process.env.DECISION_DESK_CALENDAR_PATHS;
  if (envRaw) {
    try { return JSON.parse(envRaw); }
    catch (err) {
      console.warn('Invalid DECISION_DESK_CALENDAR_PATHS JSON, falling back to config:', err.message);
    }
  }
  return fileConfig.calendar?.import_paths || {};
})();

const VALID_STATUSES = new Set(['draft', 'briefed', 'produced', 'approved', 'staged', 'posted', 'killed', 'copy-review', 'asset-ready', 'scheduled', 'published']);

function computeTier(entryDate) {
  const todayET = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  const today = new Date(todayET);
  const entry = new Date(entryDate);
  if (isNaN(entry.getTime())) return 'horizon'; // safe fallback for invalid dates
  const diffDays = Math.floor((entry - today) / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) return 'production';
  if (diffDays <= 90) return 'planned';
  return 'horizon';
}

function importCalendar(brand) {
  const filePath = CALENDAR_PATHS[brand];
  if (!filePath || !existsSync(filePath)) {
    return { error: `Calendar file not found for ${brand}` };
  }

  let raw;
  try {
    raw = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch (err) {
    return { error: `Invalid JSON in calendar file for ${brand}: ${err.message}` };
  }
  const entries = (raw.entries || []).filter(e => e && e.id && e.date);
  const skipped = (raw.entries || []).length - entries.length;
  const ts = now();

  const upsert = db.prepare(`
    INSERT INTO calendar_entries (id, brand, date, channel, sub_channel, campaign_name, campaign_month,
      concept, why_hook, content_split, product_json, copy_direction, final_copy, asset_json,
      status, paid_note, b2b_variant, tags_json, notes, posted_at, platform_draft_id, staged_at,
      performance_json, tier, imported_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      date=excluded.date, channel=excluded.channel, sub_channel=excluded.sub_channel,
      campaign_name=excluded.campaign_name, campaign_month=excluded.campaign_month,
      concept=excluded.concept, why_hook=excluded.why_hook, content_split=excluded.content_split,
      product_json=excluded.product_json, copy_direction=excluded.copy_direction,
      final_copy=excluded.final_copy, asset_json=excluded.asset_json,
      status=excluded.status, paid_note=excluded.paid_note, b2b_variant=excluded.b2b_variant,
      tags_json=excluded.tags_json, notes=excluded.notes, posted_at=excluded.posted_at,
      platform_draft_id=excluded.platform_draft_id, staged_at=excluded.staged_at,
      performance_json=excluded.performance_json, tier=excluded.tier, updated_at=excluded.updated_at
  `);

  const importMany = db.transaction((entries) => {
    let count = 0;
    for (const e of entries) {
      upsert.run(
        e.id, brand, e.date, e.channel, e.subChannel || null,
        e.campaign?.name || null, e.campaign?.month || null,
        e.concept || null, e.whyHook || null, e.contentSplit || null,
        e.product ? JSON.stringify(e.product) : null,
        e.copyDirection || null, e.finalCopy || null,
        e.asset ? JSON.stringify(e.asset) : null,
        e.status || 'draft', e.paidNote || null, e.b2bVariant || null,
        e.tags ? JSON.stringify(e.tags) : null, e.notes || null,
        e.postedAt || null, e.platformDraftId || null, e.stagedAt || null,
        e.performance ? JSON.stringify(e.performance) : null,
        computeTier(e.date), ts, ts
      );
      count++;
    }
    return count;
  });

  const count = importMany(entries);
  return { brand, imported: count, skipped, campaigns: raw.campaigns?.length || 0, at: ts };
}

// Import calendar(s) from JSON
app.post('/api/calendar/import', (req, res) => {
  try {
    const { brand } = req.query;
    if (brand && !CALENDAR_PATHS[brand]) {
      return res.status(400).json({ error: `Unknown brand: ${brand}` });
    }

    const brands = brand ? [brand] : Object.keys(CALENDAR_PATHS);
    const results = {};
    for (const b of brands) {
      results[b] = importCalendar(b);
    }
    res.json({ results });
  } catch (err) {
    console.error('POST /api/calendar/import error:', err.message);
    res.status(500).json({ error: 'Internal error. Check server log for details.' });
  }
});

// Query calendar entries
app.get('/api/calendar', (req, res) => {
  const { brand, month, channel, status, tier, from, to } = req.query;
  let sql = `SELECT ce.*, (SELECT COUNT(*) FROM calendar_flags cf WHERE cf.entry_id = ce.id AND cf.resolved_at IS NULL) as active_flags FROM calendar_entries ce WHERE 1=1`;
  const params = [];

  if (brand) { sql += ` AND ce.brand = ?`; params.push(brand); }
  if (month) {
    sql += ` AND ce.date LIKE ?`; params.push(month + '%');
  }
  if (channel) { sql += ` AND ce.channel = ?`; params.push(channel); }
  if (status) { sql += ` AND ce.status = ?`; params.push(status); }
  if (tier) { sql += ` AND ce.tier = ?`; params.push(tier); }
  if (from) { sql += ` AND ce.date >= ?`; params.push(from); }
  if (to) { sql += ` AND ce.date <= ?`; params.push(to); }

  sql += ` ORDER BY ce.date ASC, ce.channel ASC`;
  res.json(db.prepare(sql).all(...params));
});

// Calendar stats (MUST come before /:id to avoid route conflict)
app.get('/api/calendar/stats', (_req, res) => {
  const stats = db.prepare(`
    SELECT
      brand,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
      SUM(CASE WHEN status = 'produced' THEN 1 ELSE 0 END) as produced,
      SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) as posted,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN tier = 'production' THEN 1 ELSE 0 END) as production_tier,
      SUM(CASE WHEN tier = 'planned' THEN 1 ELSE 0 END) as planned_tier,
      SUM(CASE WHEN tier = 'horizon' THEN 1 ELSE 0 END) as horizon_tier,
      SUM(CASE WHEN performance_json IS NOT NULL THEN 1 ELSE 0 END) as has_performance,
      SUM(CASE WHEN final_copy IS NULL AND tier = 'production' THEN 1 ELSE 0 END) as needs_copy
    FROM calendar_entries
    GROUP BY brand
  `).all();

  const channels = db.prepare(`
    SELECT brand, channel, COUNT(*) as count
    FROM calendar_entries
    GROUP BY brand, channel
    ORDER BY count DESC
  `).all();

  const flagCount = db.prepare(`SELECT COUNT(*) as count FROM calendar_flags WHERE resolved_at IS NULL`).get().count;

  const assetsNeeded = db.prepare(`
    SELECT COUNT(*) as count FROM calendar_entries
    WHERE tier IN ('production', 'planned')
    AND (asset_json IS NULL OR asset_json LIKE '%"marketingFile":null%' OR asset_json LIKE '%"marketingFile": null%')
    AND status NOT IN ('killed', 'posted')
  `).get().count;

  res.json({ brands: stats, channels, open_flags: flagCount, assets_needed: assetsNeeded });
});

// Resolve a flag (MUST come before /:id to avoid route conflict)
app.patch('/api/calendar/flag/:flagId/resolve', (req, res) => {
  try {
    const result = db.prepare(`UPDATE calendar_flags SET resolved_at = ? WHERE id = ? AND resolved_at IS NULL`).run(now(), req.params.flagId);
    if (result.changes === 0) return res.status(404).json({ error: 'Flag not found or already resolved' });
    res.json({ id: req.params.flagId, resolved: true });
  } catch (err) {
    console.error('PATCH /api/calendar/flag/:flagId/resolve error:', err.message);
    res.status(500).json({ error: 'Internal error. Check server log for details.' });
  }
});

// Get single calendar entry with flags
app.get('/api/calendar/:id', (req, res) => {
  const entry = db.prepare(`SELECT * FROM calendar_entries WHERE id = ?`).get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });

  const flags = db.prepare(`SELECT * FROM calendar_flags WHERE entry_id = ? ORDER BY created_at DESC`).all(req.params.id);
  res.json({ ...entry, flags });
});

// Update calendar entry status (used by brand-post)
app.patch('/api/calendar/:id/status', (req, res) => {
  try {
    const { status, posted_at, staged_at, platform_draft_id } = req.body || {};

    // Require at least one field
    if (!status && !posted_at && !staged_at && !platform_draft_id) {
      return res.status(400).json({ error: 'At least one of status, posted_at, staged_at, platform_draft_id is required' });
    }

    // Validate status enum
    if (status && !VALID_STATUSES.has(status)) {
      return res.status(400).json({
        error: `Invalid status: "${status}". Must be one of: ${[...VALID_STATUSES].join(', ')}`,
      });
    }

    const entry = db.prepare(`SELECT * FROM calendar_entries WHERE id = ?`).get(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    const ts = now();
    const sets = ['updated_at = ?'];
    const params = [ts];

    if (status) { sets.push('status = ?'); params.push(status); }
    // Auto-set posted_at when transitioning to "posted" if not explicitly provided
    if (status === 'posted' && !posted_at && !entry.posted_at) {
      sets.push('posted_at = ?'); params.push(ts);
    } else if (posted_at) {
      sets.push('posted_at = ?'); params.push(posted_at);
    }
    // Auto-set staged_at when transitioning to "staged" or "posted" if not provided
    if ((status === 'staged' || status === 'posted') && !staged_at && !entry.staged_at) {
      sets.push('staged_at = ?'); params.push(ts);
    } else if (staged_at) {
      sets.push('staged_at = ?'); params.push(staged_at);
    }
    if (platform_draft_id) { sets.push('platform_draft_id = ?'); params.push(platform_draft_id); }

    params.push(req.params.id);
    db.prepare(`UPDATE calendar_entries SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    res.json({ id: req.params.id, updated: true, status: status || entry.status });
  } catch (err) {
    console.error('PATCH /api/calendar/:id/status error:', err.message);
    res.status(500).json({ error: 'Internal error. Check server log for details.' });
  }
});

// Update performance data (used by brand-learn)
app.patch('/api/calendar/:id/performance', (req, res) => {
  try {
    const { performance } = req.body || {};

    // Validate performance is an object
    if (!performance || typeof performance !== 'object' || Array.isArray(performance)) {
      return res.status(400).json({ error: 'performance must be a non-null object' });
    }

    const entry = db.prepare(`SELECT * FROM calendar_entries WHERE id = ?`).get(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    db.prepare(`UPDATE calendar_entries SET performance_json = ?, updated_at = ? WHERE id = ?`)
      .run(JSON.stringify(performance), now(), req.params.id);
    res.json({ id: req.params.id, updated: true });
  } catch (err) {
    console.error('PATCH /api/calendar/:id/performance error:', err.message);
    res.status(500).json({ error: 'Internal error. Check server log for details.' });
  }
});

// Flag a calendar entry as needing attention.
app.post('/api/calendar/:id/flag', (req, res) => {
  try {
    const { flag_type, note, agent_id } = req.body || {};
    if (!flag_type) return res.status(400).json({ error: 'flag_type is required' });

    const entry = db.prepare(`SELECT * FROM calendar_entries WHERE id = ?`).get(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    const flagId = uid();
    const ts = now();
    const flagger = agent_id || 'system';
    db.prepare(`INSERT INTO calendar_flags (id, entry_id, agent_id, flag_type, note, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(flagId, req.params.id, flagger, flag_type, note || null, ts);

    res.json({ id: flagId, entry_id: req.params.id, agent_id: flagger, flag_type, note: note || null, created_at: ts });
  } catch (err) {
    console.error('POST /api/calendar/:id/flag error:', err.message);
    res.status(500).json({ error: 'Internal error. Check server log for details.' });
  }
});

// Submit learning record (used by brand-learn skill) — atomic upsert
const learningUpsert = db.transaction((agent_id, brand, pattern, pattern_type, instruction, module) => {
  const ts = now();
  const existing = stmts.findLearning.get(agent_id, brand, pattern);
  if (existing) {
    stmts.updateLearningEvidence.run(ts, existing.id);
    return { id: existing.id, updated: true, evidence_count: existing.evidence_count + 1 };
  }
  const id = uid();
  stmts.insertLearning.run(id, null, agent_id, module, brand, pattern_type, pattern, instruction, ts, ts);
  return { id, created: true };
});

app.post('/api/learning', (req, res) => {
  try {
    const { agent_id, brand, pattern_type, pattern, instruction, module } = req.body || {};
    if (!pattern || !instruction) {
      return res.status(400).json({ error: 'pattern and instruction are required' });
    }
    const result = learningUpsert(
      agent_id || 'brand-learn',
      brand || 'unknown',
      pattern,
      pattern_type || 'positive',
      instruction,
      module || 'content'
    );
    res.json(result);
  } catch (err) {
    console.error('POST /api/learning error:', err.message);
    res.status(500).json({ error: 'Internal error. Check server log for details.' });
  }
});

// ---------------------------------------------------------------------------
// (Pre-flight checklist subsystem removed — was a customer-specific overlay.)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// API documentation
// ---------------------------------------------------------------------------
// Descriptions kept here; actual routes introspected from the Express router
// at request time so this can never drift from reality. Any route in the router
// without an entry below shows up as "undocumented" — add one or delete the route.

const ROUTE_DOCS = {
  'GET /api/config': { summary: 'Public runtime config: brands, card types, calendar/webhook flags. Frontend fetches at boot.', auth: 'none' },
  'GET /api/health': { summary: 'Service health + row counts.', auth: 'none' },
  'GET /api/routes': { summary: 'Live API catalog (this endpoint).', auth: 'none' },
  'POST /api/submit': { summary: 'Agents submit a new deliverable to the queue.', auth: 'none', body: { type: 'string (required)', brand: 'string', agent_id: 'string', title: 'string (required)', html_content: 'string (required)', subject_line: 'string', metadata: 'object | string', campaign_id: 'string (auto-created if absent)' } },
  'GET /api/queue': { summary: 'Pending deliverables (orphan — prefer /api/deliverables).', auth: 'none', query: { brand: 'string' } },
  'GET /api/deliverables': { summary: 'List deliverables with filters. Primary reader for DecisionDesk queue + executor polling.', auth: 'none', query: { status: 'submitted|approved|denied|revision_requested', brand: 'string', type: 'string', agent_id: 'string', executed: 'true|false (tri-state — unset = both)' } },
  'GET /api/card-context/:id': { summary: 'Rich context for a deliverable: prior denials, approval history, discussion, learnings.', auth: 'none' },
  'GET /api/deliverable/:id': { summary: 'Single deliverable with discussion + decisions joined.', auth: 'none' },
  'POST /api/decide': { summary: 'Record a verdict. Verdict aliases (advance/act/answered/kill/pass) normalized server-side to approved/denied.', auth: 'none', body: { deliverable_id: 'string (required)', verdict: 'approved|denied|revision_requested|advance|act|answered|kill|pass', denial_tags: 'string[]', notes: 'string' } },
  'POST /api/decision': { summary: 'Alias of POST /api/decide (frontend uses this path).', auth: 'none' },
  'POST /api/discuss': { summary: 'Post a message on a deliverable thread. Accepts `body` or `message` field.', auth: 'none', body: { deliverable_id: 'string (required)', author: 'string (required)', body: 'string (or message)', parent_id: 'string' } },
  'POST /api/deliverables/:id/executed': { summary: 'Close the loop: executor marks approved deliverable done. Fires `executed` webhook event.', auth: 'none', body: { executed_by: 'string (required) — agent or system that ran it', execution_status: 'completed|failed|partial (default completed)', execution_notes: 'string' } },
  'GET /api/intelligence': { summary: 'Learnings, agent stats, velocity, taste profile, recent decisions. Powers IntelligencePage.', auth: 'none', query: { brand: 'string' } },
  'GET /api/brand-profile': { summary: 'Structured brand context parsed from <brand>-context.md in DECISION_DESK_BRAND_CONTEXT_DIR.', auth: 'none', query: { brand: 'string (required)' } },
  'GET /api/morning-brief': { summary: 'Queue depth + stalled cards + 24h decisions + 7d stats.', auth: 'none' },
  'GET /api/history': { summary: 'Paginated decision history.', auth: 'none', query: { limit: 'int (default 50, max 200)', offset: 'int (default 0)' } },
  'GET /api/preview/:id': { summary: 'Raw HTML preview of a deliverable (served with CSP script-src none + SAMEORIGIN).', auth: 'none' },
  'GET /api/session-stats': { summary: 'Approvals + denials + count since a timestamp. Powers empty-state summary.', auth: 'none', query: { since: 'ISO timestamp (default: 24h ago)' } },
  'GET /api/file/:id': { summary: 'Serve binary file pointed to by metadata.content_path. Allowlisted roots only (DECISION_DESK_SAFE_ROOTS).', auth: 'none' },
  'POST /api/calendar/import': { summary: 'Import calendar JSON from a brand-mapped path (DECISION_DESK_CALENDAR_PATHS). Upsert by entry id.', auth: 'none', query: { brand: 'string (required, must exist in calendar paths config)' } },
  'GET /api/calendar': { summary: 'Calendar entries with filters. Main read for CalendarPage.', auth: 'none', query: { brand: 'string', month: 'YYYY-MM', channel: 'string', status: 'string', tier: 'horizon|planned|production' } },
  'GET /api/calendar/stats': { summary: 'Per-brand counts by status/tier + channel breakdown + open-flag count.', auth: 'none' },
  'PATCH /api/calendar/flag/:flagId/resolve': { summary: 'Mark a calendar flag as resolved.', auth: 'none' },
  'GET /api/calendar/:id': { summary: 'Single calendar entry with flags joined.', auth: 'none' },
  'PATCH /api/calendar/:id/status': { summary: 'Update an entry status (used by external schedulers after staging/posting).', auth: 'none', body: { status: 'draft|briefed|produced|approved|staged|posted|killed|copy-review|asset-ready|scheduled|published' } },
  'PATCH /api/calendar/:id/performance': { summary: 'Write performance JSON + letter grade (used by analytics callers).', auth: 'none', body: { performance_json: 'object | string' } },
  'POST /api/calendar/:id/flag': { summary: 'Attach a flag to a calendar entry needing attention.', auth: 'none', body: { flag_type: 'string', note: 'string' } },
  'POST /api/learning': { summary: 'Upsert a learning record (pattern + agent instruction).', auth: 'none', body: { agent_id: 'string', brand: 'string', pattern: 'string', pattern_type: 'positive|negative|note', agent_instruction: 'string' } },
};

function introspectRoutes() {
  const out = [];
  // Walk Express router stack to enumerate live routes.
  for (const layer of app._router.stack) {
    if (!layer.route) continue;
    const path = layer.route.path;
    const paths = Array.isArray(path) ? path : [path];
    const methods = Object.keys(layer.route.methods || {})
      .filter(m => layer.route.methods[m])
      .map(m => m.toUpperCase());
    for (const p of paths) {
      for (const m of methods) {
        const key = `${m} ${p}`;
        const doc = ROUTE_DOCS[key] || null;
        out.push({
          method: m,
          path: p,
          documented: !!doc,
          summary: doc?.summary || null,
          auth: doc?.auth || null,
          query: doc?.query || null,
          body: doc?.body || null,
        });
      }
    }
  }
  // Stable sort: path then method
  out.sort((a, b) => a.path === b.path ? a.method.localeCompare(b.method) : a.path.localeCompare(b.path));
  return out;
}

app.get('/api/routes', (_req, res) => {
  const routes = introspectRoutes();
  const undocumented = routes.filter(r => !r.documented && r.path.startsWith('/api/'));
  res.json({
    generated_at: now(),
    total: routes.length,
    documented: routes.length - undocumented.length,
    undocumented: undocumented.map(r => `${r.method} ${r.path}`),
    routes,
  });
});

// ---------------------------------------------------------------------------
// SPA fallback
// ---------------------------------------------------------------------------

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  const indexPath = join(distPath, 'index.html');
  if (existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).json({ message: 'Decision Desk API running. No frontend build found in ./dist/' });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

// Bind to HOST (defaults to 127.0.0.1 — single-tenant self-host posture).
// Set HOST=0.0.0.0 to expose on LAN; pair with a reverse proxy + auth.
app.listen(PORT, HOST, () => {
  console.log(`Decision Desk running on http://${HOST}:${PORT}`);
  console.log(`  data dir: ${DATA_DIR}`);
  if (NOTIFY_WEBHOOK_URL) console.log(`  webhook:  ${NOTIFY_WEBHOOK_URL}`);
  const counts = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM deliverables) as deliverables,
      (SELECT COUNT(*) FROM campaigns) as campaigns,
      (SELECT COUNT(*) FROM decisions) as decisions,
      (SELECT COUNT(*) FROM learning_records) as learnings
  `).get();
  console.log(`  DB: ${counts.deliverables} deliverables, ${counts.campaigns} campaigns, ${counts.decisions} decisions, ${counts.learnings} learnings`);
});
