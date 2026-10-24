const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;
const hits = new Map();

export function resetLoginRateLimit() {
  hits.clear();
}

export function loginRateLimit(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    entry = { count: 0, start: now };
  }
  entry.count += 1;
  hits.set(ip, entry);

  if (entry.count > MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em instantes.' });
  }
  next();
}
