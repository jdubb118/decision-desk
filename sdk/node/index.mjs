// Decision Desk Node client.
//
// Minimal HTTP wrapper for agents that submit cards, poll for verdicts, and
// mark approved work as executed. Uses the global fetch() — Node 18+.
//
// Quickstart:
//   import { Client } from './sdk/node/index.mjs';
//   const dd = new Client('http://localhost:3335', 'my-agent');
//   const card = await dd.submitCard({
//     type: 'email',
//     title: 'Welcome flow v3',
//     html_content: '<h1>Hi</h1>',
//     brand: 'default',
//   });
//   const verdict = await dd.waitForDecision(card.id);
//   if (verdict.status === 'approved') {
//     // ... do the work ...
//     await dd.markExecuted(card.id, { execution_status: 'completed', execution_notes: 'sent' });
//   }

export class DecisionDeskError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export class Client {
  constructor(baseUrl, agentId, { timeoutMs = 30000 } = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.agentId = agentId;
    this.timeoutMs = timeoutMs;
  }

  async _request(method, path, body) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new DecisionDeskError(`${method} ${path} -> ${res.status}`, res.status, data);
      }
      return data;
    } finally {
      clearTimeout(t);
    }
  }

  // ---- cards ----

  submitCard({ type, title, html_content, brand, subject_line, metadata, campaign_id }) {
    const body = { type, title, html_content, agent_id: this.agentId };
    if (brand !== undefined) body.brand = brand;
    if (subject_line !== undefined) body.subject_line = subject_line;
    if (metadata !== undefined) body.metadata = metadata;
    if (campaign_id !== undefined) body.campaign_id = campaign_id;
    return this._request('POST', '/api/submit', body);
  }

  getCard(cardId) {
    return this._request('GET', `/api/deliverable/${cardId}`);
  }

  listPending(brand) {
    return this._request('GET', `/api/deliverables?status=submitted${brand ? `&brand=${brand}` : ''}`);
  }

  listApprovedUnexecuted(brand) {
    return this._request('GET', `/api/deliverables?status=approved&executed=false${brand ? `&brand=${brand}` : ''}`);
  }

  // ---- verdicts ----

  async waitForDecision(cardId, { timeoutMs = 3600_000, pollMs = 5_000 } = {}) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const card = await this.getCard(cardId);
      if (card.status !== 'submitted') return card;
      await new Promise(r => setTimeout(r, pollMs));
    }
    throw new Error(`Card ${cardId} still pending after ${timeoutMs}ms`);
  }

  markExecuted(cardId, { execution_status = 'completed', execution_notes = null } = {}) {
    return this._request('POST', `/api/deliverables/${cardId}/executed`, {
      executed_by: this.agentId,
      execution_status,
      execution_notes,
    });
  }

  // ---- discussion + intelligence ----

  discuss(cardId, body, { parent_id = null } = {}) {
    return this._request('POST', '/api/discuss', {
      deliverable_id: cardId,
      author: this.agentId,
      body,
      parent_id,
    });
  }

  getIntelligence(brand) {
    return this._request('GET', `/api/intelligence${brand ? `?brand=${brand}` : ''}`);
  }

  getConfig() {
    return this._request('GET', '/api/config');
  }
}
