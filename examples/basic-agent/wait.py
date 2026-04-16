#!/usr/bin/env python3
"""Poll a card until the reviewer approves or denies it.

Usage: python wait.py <card_id>

If approved, this script also marks the card executed — closing the loop.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "sdk", "python"))
from decision_desk import Client  # noqa: E402

if len(sys.argv) < 2:
    print("usage: wait.py <card_id>", file=sys.stderr)
    sys.exit(2)

card_id = sys.argv[1]
DESK = os.environ.get("DECISION_DESK_URL", "http://127.0.0.1:3335")

dd = Client(DESK, agent_id="basic-agent")
print(f"polling {card_id} for verdict (Ctrl-C to stop)...")
verdict = dd.wait_for_decision(card_id, timeout=3600, poll_interval=3)
print(f"verdict: {verdict['status']}")
if verdict.get("decisions"):
    last = verdict["decisions"][0]
    if last.get("notes"):
        print(f"  notes: {last['notes']}")
    if last.get("denial_tags"):
        print(f"  denial tags: {last['denial_tags']}")

if verdict["status"] == "approved":
    print("doing the work... (pretend)")
    result = dd.mark_executed(
        card_id,
        execution_status="completed",
        execution_notes="example agent finished — sent via SMTP",
    )
    print(f"executed at {result['executed_at']}")
elif verdict["status"] == "denied":
    print("noted. The agent should learn from the denial tags above.")
    print("(see GET /api/intelligence for the running pattern list.)")
