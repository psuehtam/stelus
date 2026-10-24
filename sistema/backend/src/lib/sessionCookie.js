export const SESSION_COOKIE = 'stelus_session';
export const SESSION_MAX_AGE_SEC = 12 * 60 * 60;

const COOKIE_BASE = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
};

export function cookieSecure() {
  if (process.env.COOKIE_SECURE === 'true') return true;
  if (process.env.COOKIE_SECURE === 'false') return false;
  return (process.env.FRONTEND_URL ?? '').startsWith('https');
}

export function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, {
    ...COOKIE_BASE,
    maxAge: SESSION_MAX_AGE_SEC * 1000,
    secure: cookieSecure(),
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, {
    ...COOKIE_BASE,
    secure: cookieSecure(),
  });
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of String(header).split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}

export function getSessionToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return parseCookies(req.headers.cookie)[SESSION_COOKIE] ?? null;
}
