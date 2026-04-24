#!/usr/bin/env node
// Production smoke test. Runs a set of expectations against a deployed URL.
// Usage: BASE_URL=https://your-app.up.railway.app npm run smoke-test

const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log(`✓ ${name}`);
  } catch (err) {
    results.push({ name, pass: false, error: err.message });
    console.error(`✗ ${name}: ${err.message}`);
  }
}

async function expectStatus(path, expected, init = {}) {
  const res = await fetch(`${baseUrl}${path}`, init);
  if (res.status !== expected) {
    throw new Error(`expected ${expected}, got ${res.status} at ${path}`);
  }
  return res;
}

await check('GET /api/health returns 200', async () => {
  const res = await expectStatus('/api/health', 200);
  const body = await res.json();
  if (body.status !== 'ok') throw new Error(`bad body: ${JSON.stringify(body)}`);
});

await check('GET /api/domains returns 200 with array', async () => {
  const res = await expectStatus('/api/domains', 200);
  const body = await res.json();
  if (!Array.isArray(body.domains) || body.domains.length === 0) {
    throw new Error('no domains returned');
  }
});

await check('GET /api/history/me without token → 401', async () => {
  await expectStatus('/api/history/me', 401);
});

await check('GET /api/admin/overview without token → 401', async () => {
  await expectStatus('/api/admin/overview', 401);
});

await check('GET /api/admin/overview with bad token → 401', async () => {
  await expectStatus('/api/admin/overview', 401, {
    headers: { Authorization: 'Bearer not-a-real-token' },
  });
});

await check('POST /api/discussion/start without token → 401', async () => {
  await expectStatus('/api/discussion/start', 401, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea: 'x', domain: { id: 'consulting' } }),
  });
});

await check('POST /api/discussion/analyze-website without token → 401', async () => {
  await expectStatus('/api/discussion/analyze-website', 401, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' }),
  });
});

await check('GET / serves the client HTML', async () => {
  const res = await expectStatus('/', 200);
  const text = await res.text();
  if (!text.includes('<div id="root"')) throw new Error('not the SPA shell');
});

const failed = results.filter((r) => !r.pass);
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed against ${baseUrl}`,
);
process.exit(failed.length === 0 ? 0 : 1);
