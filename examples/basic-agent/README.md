# Basic Agent Example

End-to-end demo of the submit → review → execute loop using both the Python and Node SDKs.

## Prerequisites

```bash
# from repo root
npm install && npm run build && npm start &
```

Decision Desk is now serving at `http://127.0.0.1:3335`.

## Python flow

```bash
python examples/basic-agent/submit.py
# -> prints a card id, e.g. "submitted card id: WQ8zoqdXAKRF"

# open http://127.0.0.1:3335 in a browser, swipe right (approve)

python examples/basic-agent/wait.py WQ8zoqdXAKRF
# -> "verdict: approved" then "executed at 2026-04-16T16:39:39Z"
```

No external Python deps — uses stdlib `urllib`.

## Node flow

```bash
node examples/basic-agent/submit.mjs
node examples/basic-agent/wait.mjs <card_id>
```

Requires Node 18+ for built-in `fetch`. No external npm deps.

## What the SDK gives you

- `submit_card(...)` / `submitCard(...)` — POST to `/api/submit`
- `wait_for_decision(card_id, timeout=...)` / `waitForDecision(cardId, ...)` — long-poll until verdict
- `mark_executed(card_id, ...)` / `markExecuted(cardId, ...)` — close the loop after running the work
- `get_intelligence(brand?)` / `getIntelligence(brand?)` — read learnings + denial taste so your agent's next prompt avoids past mistakes
- `discuss(card_id, body)` — post a thread comment

See `sdk/python/decision_desk.py` and `sdk/node/index.mjs` for the full surface.
