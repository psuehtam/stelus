process.env.JWT_SECRET ??= 'stelus-test-secret';
process.env.FRONTEND_URL ??= 'http://localhost:3001';
process.env.COOKIE_SECURE = 'false';

import { createServer } from 'node:http';
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createApp } from '../app.js';
import { closePool } from '../lib/db.js';
import { resetLoginRateLimit } from './loginRateLimit.js';

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

const anonymousPaths = [
  '/api/dashboard',
  '/api/servicos',
  '/api/clientes',
  '/api/auth/me',
  '/generated/arquivo.pdf',
];

test('rotas protegidas respondem 401 sem sessão', async (t) => {
  const server = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  for (const path of anonymousPaths) {
    const { status, body } = await request(server, path);
    assert.equal(status, 401, path);
    assert.equal(body.error, 'Token não informado');
  }
});

test('Bearer inválido responde 401', async (t) => {
  const server = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { status } = await request(server, '/api/auth/me', {
    headers: { Authorization: 'Bearer not-a-jwt' },
  });
  assert.equal(status, 401);
});

test('cookie inválido responde 401', async (t) => {
  const server = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { status } = await request(server, '/api/auth/me', {
    headers: { Cookie: 'stelus_session=not-a-jwt' },
  });
  assert.equal(status, 401);
});

test('cookie válido autoriza /generated mesmo sem o arquivo', async (t) => {
  const server = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const token = jwt.sign(
    { id: 1, email: 'admin@stelus.com.br', perfil: 'admin', nome: 'Admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );

  const denied = await request(server, '/generated/nao-existe.pdf');
  assert.equal(denied.status, 401);

  const withCookie = await request(server, '/generated/nao-existe.pdf', {
    headers: { Cookie: `stelus_session=${token}` },
  });
  assert.equal(withCookie.status, 404);

  const withBearer = await request(server, '/generated/nao-existe.pdf', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(withBearer.status, 404);
});

test('POST /api/auth/login sem corpo responde 400', async (t) => {
  const server = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { status, body } = await request(server, '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(status, 400);
  assert.equal(body.error.includes('obrigatórios'), true);
});

test('nona tentativa de login no mesmo IP responde 429', async (t) => {
  resetLoginRateLimit();
  const server = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const payload = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  };

  for (let i = 0; i < 8; i += 1) {
    const { status } = await request(server, '/api/auth/login', payload);
    assert.equal(status, 400);
  }

  const { status } = await request(server, '/api/auth/login', payload);
  assert.equal(status, 429);
});
