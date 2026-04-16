#!/usr/bin/env node
// Submit a sample card from a Node agent.
// Usage: node submit.mjs

import { Client } from '../../sdk/node/index.mjs';

const DESK = process.env.DECISION_DESK_URL || 'http://127.0.0.1:3335';
const dd = new Client(DESK, 'basic-agent');

const card = await dd.submitCard({
  type: 'email',
  title: 'Welcome flow v3 (from node)',
  html_content: `
    <h1 style="font-family:sans-serif">Welcome aboard</h1>
    <p style="font-family:sans-serif;color:#555">
      We're glad you're here. Click below to set up your account.
    </p>
    <a href="#" style="display:inline-block;padding:10px 18px;background:#6366f1;color:white;text-decoration:none;border-radius:6px">Get started</a>
  `,
  subject_line: "Welcome — let's set you up",
  metadata: { campaign: 'onboarding-v3-node', audience: 'first-time-signup' },
});

console.log(`submitted card id: ${card.id}`);
console.log(`  status: ${card.status}`);
console.log(`  view it at: ${DESK}`);
console.log();
console.log('approve / deny in the UI, then run:');
console.log(`  node examples/basic-agent/wait.mjs ${card.id}`);
