import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loginRateLimit, resetLoginRateLimit } from './loginRateLimit.js';

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('loginRateLimit permite até 8 tentativas e bloqueia a 9ª', () => {
  resetLoginRateLimit();
  const req = { ip: '203.0.113.10' };

  for (let i = 0; i < 8; i += 1) {
    const res = mockRes();
    let called = false;
    loginRateLimit(req, res, () => {
      called = true;
    });
    assert.equal(called, true);
    assert.equal(res.statusCode, 200);
  }

  const blocked = mockRes();
  let called = false;
  loginRateLimit(req, blocked, () => {
    called = true;
  });
  assert.equal(called, false);
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.body.error.includes('Muitas tentativas'), true);
});
