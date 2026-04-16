// Tiny auth-aware fetch wrapper.
//
// When the server has DECISION_DESK_WRITE_TOKEN set, every mutating request
// must include `Authorization: Bearer <token>`. Rather than refactor every
// `fetch()` call in the app, we wrap the global once: same-origin mutating
// requests get the stored token automatically. Reads pass through unchanged.
//
// On the first 401/403 from a write, we clear the cached token and reprompt
// so a wrong token can be corrected without a page reload.

const TOKEN_KEY = 'decisionDesk.writeToken';
const MUTATING = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

function getToken(): string | null {
  return typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
}

function setToken(tok: string | null) {
  if (typeof window === 'undefined') return;
  if (tok) window.localStorage.setItem(TOKEN_KEY, tok);
  else window.localStorage.removeItem(TOKEN_KEY);
}

function promptForToken(reason = 'Decision Desk is protected. Enter your write token:'): string | null {
  if (typeof window === 'undefined') return null;
  const tok = window.prompt(reason, getToken() || '');
  if (!tok) return null;
  setToken(tok);
  return tok;
}

function isSameOrigin(input: RequestInfo | URL): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const url = typeof input === 'string'
      ? new URL(input, window.location.origin)
      : input instanceof URL
        ? input
        : new URL((input as Request).url);
    return url.origin === window.location.origin;
  } catch {
    // Relative paths — same origin.
    return true;
  }
}

function methodOf(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof input !== 'string' && !(input instanceof URL) && input.method) return input.method.toUpperCase();
  return 'GET';
}

export function installAuthFetch() {
  if (typeof window === 'undefined' || !window.fetch) return;
  const raw = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const method = methodOf(input, init);
    if (!MUTATING.has(method) || !isSameOrigin(input)) {
      return raw(input, init);
    }

    // Attach the stored token (if any). Server decides whether to enforce.
    const tok = getToken();
    const headers = new Headers(init?.headers || (typeof input !== 'string' && !(input instanceof URL) ? (input as Request).headers : undefined));
    if (tok && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${tok}`);

    const res = await raw(input, { ...init, headers });

    // Prompt on 401/403 then retry once with the new token.
    if ((res.status === 401 || res.status === 403) && typeof window !== 'undefined') {
      const fresh = promptForToken(
        res.status === 401
          ? 'Decision Desk is protected. Enter your write token:'
          : 'That write token was rejected. Enter the correct one:',
      );
      if (!fresh) return res;
      const retryHeaders = new Headers(init?.headers);
      retryHeaders.set('Authorization', `Bearer ${fresh}`);
      return raw(input, { ...init, headers: retryHeaders });
    }

    return res;
  };
}
