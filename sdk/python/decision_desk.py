"""Decision Desk Python client.

Minimal HTTP client for agents that submit cards, poll for verdicts, and
mark approved work as executed. Stdlib only — no requests/httpx.

Quickstart:

    from decision_desk import Client
    dd = Client("http://localhost:3335", agent_id="my-agent")
    card = dd.submit_card(
        type="email",
        title="Welcome flow v3",
        html_content="<h1>Hi</h1>",
        brand="default",
    )
    verdict = dd.wait_for_decision(card["id"], timeout=3600)
    if verdict["status"] == "approved":
        # ... do the work ...
        dd.mark_executed(card["id"], execution_status="completed",
                         execution_notes="sent via SMTP")
"""

from __future__ import annotations

import json
import time
import urllib.request
import urllib.error
from typing import Any


class DecisionDeskError(Exception):
    """Raised when the server returns a non-2xx response."""


class Client:
    def __init__(self, base_url: str, agent_id: str, token: str | None = None, timeout: float = 30.0):
        """Create a Decision Desk client.

        token: optional bearer token. Required when the server has
               DECISION_DESK_WRITE_TOKEN set; ignored otherwise. Read calls
               always work without it.
        """
        self.base_url = base_url.rstrip("/")
        self.agent_id = agent_id
        self.token = token
        self.timeout = timeout

    # -- core HTTP --------------------------------------------------------

    def _request(self, method: str, path: str, body: dict | None = None) -> Any:
        url = f"{self.base_url}{path}"
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(url, data=data, method=method)
        if body is not None:
            req.add_header("Content-Type", "application/json")
        if self.token:
            req.add_header("Authorization", f"Bearer {self.token}")
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            try:
                detail = json.loads(e.read().decode("utf-8"))
            except Exception:
                detail = {"error": str(e)}
            raise DecisionDeskError(f"{method} {path} -> {e.code}: {detail}")

    # -- cards ------------------------------------------------------------

    def submit_card(
        self,
        *,
        type: str,
        title: str,
        html_content: str,
        brand: str | None = None,
        subject_line: str | None = None,
        metadata: dict | None = None,
        campaign_id: str | None = None,
    ) -> dict:
        """Submit a new card to the queue. Returns {id, campaign_id, version, status}."""
        body = {
            "type": type,
            "title": title,
            "html_content": html_content,
            "agent_id": self.agent_id,
        }
        if brand is not None:
            body["brand"] = brand
        if subject_line is not None:
            body["subject_line"] = subject_line
        if metadata is not None:
            body["metadata"] = metadata
        if campaign_id is not None:
            body["campaign_id"] = campaign_id
        return self._request("POST", "/api/submit", body)

    def get_card(self, card_id: str) -> dict:
        """Fetch one card with discussion + decisions joined."""
        return self._request("GET", f"/api/deliverable/{card_id}")

    def list_pending(self, brand: str | None = None) -> list[dict]:
        """List cards still awaiting a verdict."""
        path = "/api/deliverables?status=submitted"
        if brand:
            path += f"&brand={brand}"
        return self._request("GET", path)

    def list_approved_unexecuted(self, brand: str | None = None) -> list[dict]:
        """List approved cards that haven't been executed yet — your work queue."""
        path = "/api/deliverables?status=approved&executed=false"
        if brand:
            path += f"&brand={brand}"
        return self._request("GET", path)

    # -- verdicts ---------------------------------------------------------

    def wait_for_decision(self, card_id: str, timeout: int = 3600, poll_interval: int = 5) -> dict:
        """Block until the card has a verdict, then return its full record."""
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            card = self.get_card(card_id)
            if card["status"] != "submitted":
                return card
            time.sleep(poll_interval)
        raise TimeoutError(f"Card {card_id} still pending after {timeout}s")

    def mark_executed(
        self,
        card_id: str,
        *,
        execution_status: str = "completed",
        execution_notes: str | None = None,
    ) -> dict:
        """Close the loop — call this after the agent runs the approved work."""
        return self._request(
            "POST",
            f"/api/deliverables/{card_id}/executed",
            {
                "executed_by": self.agent_id,
                "execution_status": execution_status,
                "execution_notes": execution_notes,
            },
        )

    # -- discussion + intelligence ---------------------------------------

    def discuss(self, card_id: str, body: str, *, parent_id: str | None = None) -> dict:
        return self._request(
            "POST",
            "/api/discuss",
            {
                "deliverable_id": card_id,
                "author": self.agent_id,
                "body": body,
                "parent_id": parent_id,
            },
        )

    def get_intelligence(self, brand: str | None = None) -> dict:
        """Fetch learnings + agent stats. Use the 'learnings' field to inform agent prompts."""
        path = "/api/intelligence" + (f"?brand={brand}" if brand else "")
        return self._request("GET", path)

    def get_config(self) -> dict:
        return self._request("GET", "/api/config")
