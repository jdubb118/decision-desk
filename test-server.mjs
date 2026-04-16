// Quick smoke test for Decision Desk server
const BASE = process.env.DECISION_DESK_URL || 'http://localhost:3335';

async function test() {
  // Health
  const health = await fetch(`${BASE}/api/health`).then(r => r.json());
  console.log('Health:', health.status, '| counts:', JSON.stringify(health.counts));

  // Submit
  const sub = await fetch(`${BASE}/api/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'email', brand: 'default', agent_id: 'test-agent', title: 'Welcome Email', html_content: '<h1>Welcome</h1>', subject_line: 'Welcome' })
  }).then(r => r.json());
  console.log('Submit:', sub.id, 'v' + sub.version, sub.status);

  // Queue
  const queue = await fetch(`${BASE}/api/queue`).then(r => r.json());
  console.log('Queue:', queue.length, 'pending');

  // Decide (deny)
  const dec = await fetch(`${BASE}/api/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliverable_id: sub.id, verdict: 'denied', denial_tags: ['off-tone', 'too-salesy'], notes: 'Tone mismatch' })
  }).then(r => r.json());
  console.log('Decide:', dec.verdict);

  // Intelligence
  const intel = await fetch(`${BASE}/api/intelligence`).then(r => r.json());
  console.log('Intelligence:', intel.learnings.length, 'learnings,', intel.agent_stats.length, 'agents,', intel.taste_profile.length, 'tags');

  // Submit + approve
  const sub2 = await fetch(`${BASE}/api/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'email', brand: 'default', agent_id: 'test-agent', title: 'Good Email', html_content: '<h1>Great</h1>' })
  }).then(r => r.json());
  await fetch(`${BASE}/api/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliverable_id: sub2.id, verdict: 'approved', notes: 'Perfect' })
  });

  // Discuss
  await fetch(`${BASE}/api/discuss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliverable_id: sub2.id, author: 'reviewer', body: 'Ship it!' })
  });

  // Card context
  const ctx = await fetch(`${BASE}/api/card-context/${sub2.id}`).then(r => r.json());
  console.log('Card context:', Object.keys(ctx).join(', '), '| discussion:', ctx.discussion.length, '| learnings:', ctx.learnings.length);

  // Morning brief
  const brief = await fetch(`${BASE}/api/morning-brief`).then(r => r.json());
  console.log('Brief: queue_depth=' + brief.queue_depth, 'stalled=' + brief.stalled.length);

  // History
  const hist = await fetch(`${BASE}/api/history`).then(r => r.json());
  console.log('History:', hist.total, 'decisions');

  // Deliverables filtered
  const filtered = await fetch(`${BASE}/api/deliverables?brand=default`).then(r => r.json());
  console.log('Deliverables (default):', filtered.length);

  // Deliverable detail
  const detail = await fetch(`${BASE}/api/deliverable/${sub2.id}`).then(r => r.json());
  console.log('Detail:', detail.title, '| decisions:', detail.decisions.length, '| discussion:', detail.discussion.length);

  // Mark approved card executed (closes the loop)
  const exec = await fetch(`${BASE}/api/deliverables/${sub2.id}/executed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ executed_by: 'test-agent', execution_status: 'completed', execution_notes: 'sent via SMTP' })
  }).then(r => r.json());
  console.log('Executed:', exec.execution_status, 'at', exec.executed_at);

  console.log('\nALL TESTS PASSED');
}

test().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
