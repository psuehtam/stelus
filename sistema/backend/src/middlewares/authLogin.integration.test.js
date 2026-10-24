import dotenv from 'dotenv';

dotenv.config();

process.env.FRONTEND_URL ??= 'http://localhost:3001';
process.env.COOKIE_SECURE = 'false';

import { createServer } from 'node:http';
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { closePool } from '../lib/db.js';

after(async () => {
  await closePool();
});

function listen() {
  const app = createApp();
  const server = createServer(app);
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function request(server, pathname, options = {}) {
  const { port } = server.address();
  const res = await fetch(`http://127.0.0.1:${port}${pathname}`, options);
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body, headers: res.headers };
}

function sessionCookie(headers) {
  const cookies = headers.getSetCookie?.() ?? [];
  const line = cookies.find((c) => c.startsWith('stelus_session='));
  return line ? line.split(';')[0] : null;
}

test('login admin define cookie httpOnly e funcionário não acessa rotas admin', async (t) => {
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    t.skip('DATABASE_URL/JWT_SECRET ausentes');
    return;
  }

  const server = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const adminLogin = await request(server, '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@stelus.com.br', senha: 'admin123' }),
  });

  if (adminLogin.status >= 500) {
    t.skip('banco indisponível');
    return;
  }

  assert.equal(adminLogin.status, 200);
  assert.equal(adminLogin.body.usuario.perfil, 'admin');
  const adminCookies = adminLogin.headers.getSetCookie();
  assert.ok(adminCookies.some((c) => c.startsWith('stelus_session=')));
  assert.ok(adminCookies.some((c) => c.toLowerCase().includes('httponly')));
  assert.ok(adminCookies.every((c) => !/;\s*domain=/i.test(c)));

  const adminCookie = sessionCookie(adminLogin.headers);
  const dashboard = await request(server, '/api/dashboard', {
    headers: { Cookie: adminCookie },
  });
  assert.equal(dashboard.status, 200);

  const relatorio = await request(server, '/api/relatorio-operacional', {
    headers: { Cookie: adminCookie },
  });
  assert.equal(relatorio.status, 200);

  const funcLogin = await request(server, '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'funcionario@stelus.com.br', senha: 'func123' }),
  });
  assert.equal(funcLogin.status, 200);
  const funcCookie = sessionCookie(funcLogin.headers);

  const servicos = await request(server, '/api/servicos', {
    headers: { Cookie: funcCookie },
  });
  assert.equal(servicos.status, 200);

  for (const path of ['/api/dashboard', '/api/fechamentos', '/api/relatorio-operacional', '/api/auth/usuarios']) {
    const { status } = await request(server, path, { headers: { Cookie: funcCookie } });
    assert.equal(status, 403, path);
  }

  const logout = await request(server, '/api/auth/logout', { method: 'POST' });
  assert.equal(logout.status, 204);
});
