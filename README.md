# Decision Desk

A swipeable inbox for reviewing AI-agent output. Self-hosted, single-tenant, zero-auth.

Your agents submit deliverables (emails, social posts, code proposals — any HTML payload) to a queue. You swipe approve / deny / discuss. The desk learns your taste from denial tags and surfaces those patterns back to your agents so they stop making the same mistakes.

## What's inside

- **Decision queue** — swipe-to-approve UI over a SQLite-backed card store
- **Intelligence** — denial-tag → pattern → agent-instruction loop, plus per-agent stats and velocity
- **Calendar** — month-grid view of scheduled content with status, tier, and flag tracking
- **Discussion** — threaded comments per card
- **Webhooks** — fire-and-forget POSTs on every verdict and execution event
- **Multi-brand** — register any number of brands in `config.json`; the UI auto-renders a brand toggle and themed previews
- **SDKs** — minimal Python and Node clients (stdlib only, no external deps)

## Quickstart

```bash
git clone <repo> decision-desk && cd decision-desk
npm install
npm run build              # builds the React frontend into ./dist
npm start                  # boots http://127.0.0.1:3335
```

That's it. No config file required — sensible defaults put the SQLite DB at `./data/decision-desk.db`. The desk runs single-brand by default; the brand toggle stays hidden until you register more than one.

## Configuration

Two ways to configure, in priority order: **env vars > `config.json` > built-in defaults**.

```bash
cp config.example.json config.json
$EDITOR config.json
```

```jsonc
{
  "port": 3335,
  "host": "127.0.0.1",
  "data_dir": "./data",
  "brands": [
    { "id": "default", "label": "Default", "color": "#6366f1" }
  ],
  "notifications": { "webhook_url": null }
}
```

For per-shell overrides, copy `.env.example` to `.env` and use `DECISION_DESK_*` env vars.

### Multi-brand

Register more brands and the UI grows a toggle. Each brand defines its theme color and (optionally) the domain / handle / founder name used in mockup previews.

```json
"brands": [
  { "id": "acme",   "label": "Acme",   "color": "#c4a35a", "domain": "acme.com",   "handle": "acme_official" },
  { "id": "globex", "label": "Globex", "color": "#3d5a73", "domain": "globex.io", "handle": "globex" }
]
```

When agents submit cards, they pass `brand: "acme"` to scope cards / decisions / learning to that brand.

## Submitting a card from your agent

Use one of the SDKs — full example in [`examples/basic-agent/`](examples/basic-agent/):

```python
# pip-free Python (stdlib only)
import sys
sys.path.insert(0, "sdk/python")
from decision_desk import Client

dd = Client("http://localhost:3335", agent_id="my-agent")
card = dd.submit_card(
    type="email",
    title="Welcome flow v3",
    html_content="<h1>Hi</h1>",
    brand="default",
)
verdict = dd.wait_for_decision(card["id"])
if verdict["status"] == "approved":
    # ... do the work ...
    dd.mark_executed(card["id"], execution_notes="sent via SMTP")
```

```js
// Node 18+ (built-in fetch, no deps)
import { Client } from './sdk/node/index.mjs';

const dd = new Client('http://localhost:3335', 'my-agent');
const card = await dd.submitCard({
  type: 'email',
  title: 'Welcome flow v3',
  html_content: '<h1>Hi</h1>',
});
const verdict = await dd.waitForDecision(card.id);
if (verdict.status === 'approved') {
  await dd.markExecuted(card.id, { execution_notes: 'sent via SMTP' });
}
```

Or skip the SDK entirely and POST to `/api/submit`. The full route catalogue is at [`GET /api/routes`](http://127.0.0.1:3335/api/routes) once the server is running.

## Closing the loop

When you approve a card, the agent that submitted it polls for the verdict, runs the work, then marks the card executed. That fires an `executed` webhook event (if `notifications.webhook_url` is set) so your downstream systems know it shipped.

## Webhooks

Set `notifications.webhook_url` (and optionally `webhook_secret`) and Decision Desk POSTs JSON events on every decision and execution:

```json
{ "event": "decision", "card": { "id": "...", "type": "email", "title": "..." }, "verdict": "approved", "raw_verdict": "approved", "notes": null, "timestamp": "2026-04-16T12:00:00Z" }
```

When `webhook_secret` is set, the request includes an `X-DecisionDesk-Signature: sha256=<hex>` header — HMAC-SHA256 over the raw body.

## Status

Day 2 of the OSS fork. The API, database schema, and SDK shape are stable. Coming next: Docker packaging, retention/archival policy, optional auth.

## License

MIT.
