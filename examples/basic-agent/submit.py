#!/usr/bin/env python3
"""Submit a sample card to the local Decision Desk.

Run after `npm start` so the server is up at http://127.0.0.1:3335.
Prints the new card id — feed it into wait.py to poll for the verdict.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "sdk", "python"))
from decision_desk import Client  # noqa: E402

DESK = os.environ.get("DECISION_DESK_URL", "http://127.0.0.1:3335")

dd = Client(DESK, agent_id="basic-agent")
card = dd.submit_card(
    type="email",
    title="Welcome flow v3",
    html_content="""
        <h1 style="font-family:sans-serif">Welcome aboard</h1>
        <p style="font-family:sans-serif;color:#555">
            We're glad you're here. Click below to set up your account.
        </p>
        <a href="#" style="display:inline-block;padding:10px 18px;background:#6366f1;color:white;text-decoration:none;border-radius:6px">Get started</a>
    """,
    subject_line="Welcome — let's set you up",
    metadata={"campaign": "onboarding-v3", "audience": "first-time-signup"},
)

print(f"submitted card id: {card['id']}")
print(f"  status: {card['status']}")
print(f"  view it at: {DESK}")
print()
print(f"approve / deny in the UI, then run:")
print(f"  python examples/basic-agent/wait.py {card['id']}")
