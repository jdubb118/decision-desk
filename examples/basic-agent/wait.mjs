#!/usr/bin/env node
// Poll a card until verdict, then close the loop if approved.
// Usage: node wait.mjs <card_id>

import { Client } from '../../sdk/node/index.mjs';

const cardId = process.argv[2];
if (!cardId) {
  console.error('usage: wait.mjs <card_id>');
  process.exit(2);
}

const DESK = process.env.DECISION_DESK_URL || 'http://127.0.0.1:3335';
const dd = new Client(DESK, 'basic-agent');

console.log(`polling ${cardId} for verdict (Ctrl-C to stop)...`);
const verdict = await dd.waitForDecision(cardId, { timeoutMs: 3600_000, pollMs: 3000 });
console.log(`verdict: ${verdict.status}`);
const last = verdict.decisions?.[0];
if (last?.notes) console.log(`  notes: ${last.notes}`);
if (last?.denial_tags) console.log(`  denial tags: ${last.denial_tags}`);

if (verdict.status === 'approved') {
  console.log('doing the work... (pretend)');
  const result = await dd.markExecuted(cardId, {
    execution_status: 'completed',
    execution_notes: 'node example finished',
  });
  console.log(`executed at ${result.executed_at}`);
} else if (verdict.status === 'denied') {
  console.log('noted. Agent should learn from the denial tags above.');
  console.log('(see GET /api/intelligence for the running pattern list.)');
}
