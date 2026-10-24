import jwt from 'jsonwebtoken';
import { getSessionToken } from '../lib/sessionCookie.js';

export function authMiddleware(req, res, next) {
  const token = getSessionToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status ?? 500;
  res.status(status).json({ error: err.message ?? 'Erro interno do servidor' });
}
