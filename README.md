# Decision Desk

A swipeable inbox for reviewing AI-agent output. Self-hosted, single-tenant, zero-auth.

Your agents submit deliverables (emails, social posts, code proposals — any HTML payload) to a queue. You swipe approve / deny / discuss. The desk learns your taste from denial tags and surfaces those patterns back to your agents so they stop making the same mistakes.

## What's inside

- **Decision queue** — swipe-to-approve UI over a SQLite-backed card store
- **Intelligence** — denial-tag → pattern → agent-instruction loop, plus per-agent stats and velocity
- **Calendar** — month-grid view of scheduled content with status, tier, and flag tracking
- **Discussion** — threaded comments per card
- **Webhooks** — fire-and-forget POSTs on every verdict and execution event

## Quickstart

```bash
git clone <repo> decision-desk && cd decision-desk
npm install
npm run build              # builds the React frontend into ./dist
npm start                  # boots http://127.0.0.1:3335
```

That's it. No config file required — sensible defaults put the SQLite DB at `./data/decision-desk.db`.

To customise, copy `.env.example` to `.env` and tweak.

## Submitting a card from your agent

```bash
curl -X POST http://127.0.0.1:3335/api/submit \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id":  "my-agent",
    "type":      "email",
    "title":     "Welcome flow v3",
    "html_content": "<h1>Hi</h1>"
  }'
```

The full route catalogue is at [`GET /api/routes`](http://127.0.0.1:3335/api/routes) once the server is running.

## Closing the loop

When you mark a card approved, the agent that submitted it polls for the verdict and runs the work:

```bash
# poll
curl 'http://127.0.0.1:3335/api/deliverables?status=approved&executed=false'

# after running it
curl -X POST http://127.0.0.1:3335/api/deliverables/<id>/executed \
  -H 'Content-Type: application/json' \
  -d '{"executed_by":"my-agent","execution_status":"completed","execution_notes":"sent via SMTP"}'
```

That marks the card done and (if `DECISION_DESK_WEBHOOK_URL` is set) fires an `executed` webhook event so your downstream systems know.

## Status

This is a **Day 1 fork** from a private internal build. Multi-brand UI, an SDK, and Docker packaging are coming in subsequent days. The API and database schema are stable.

## License

MIT.
