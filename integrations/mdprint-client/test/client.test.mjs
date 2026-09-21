import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient, MdprintError, validateBaseUrl } from '../client.mjs';
import { run } from '../cli.mjs';

const json = value => Response.json(value);
test('all five methods use documented GET routes and return JSON envelopes', async () => {
  const paths = [];
  const client = createClient({ fetch: async (url, init) => {
    assert.equal(init.method, 'GET'); assert.equal(init.redirect, 'error');
    assert.equal(init.body, undefined); assert.equal(init.headers.Authorization, undefined);
    paths.push(new URL(url).pathname + new URL(url).search);
    return json({ product: {}, examples: [], example: { markdown: '# Sample' }, sections: [], section: { content: 'Documentation' } });
  } });
  await client.getInfo(); await client.listExamples();
  assert.equal((await client.getExample('basic')).example.markdown, '# Sample');
  await client.listDocs(); await client.getDoc('privacy');
  assert.deepEqual(paths, ['/api/v1/info', '/api/v1/examples', '/api/v1/examples?id=basic', '/api/v1/docs', '/api/v1/docs?id=privacy']);
});
test('origin and IDs reject credentials, path injection and non-loopback HTTP', () => {
  for (const url of ['http://example.com', 'http://localhost.evil.test', 'file:///tmp/file', 'https://example.com/path', 'https://user:pass@example.com', 'https://example.com?key=secret', 'https://example.com/#fragment']) {
    assert.throws(() => validateBaseUrl(url), error => error.code === 'invalid_base_url');
  }
  for (const url of ['https://mdprint.app', 'http://127.0.0.1:4340', 'http://localhost:4340', 'http://[::1]:4340']) assert.equal(validateBaseUrl(url), url);
  const client = createClient({ fetch: () => { throw Error('must not fetch'); } });
  for (const id of ['../private', 'privacy&key=secret', '', 'a'.repeat(65), null]) assert.throws(() => client.getDoc(id), error => error.code === 'invalid_id');
});
test('HTTP and network errors never echo remote response text or exceptions', async () => {
  for (const [status, code] of [[404, 'not_found'], [429, 'rate_limited'], [500, 'http_error']]) {
    await assert.rejects(createClient({ fetch: async () => new Response('REMOTE SECRET', { status }) }).getInfo(), error => error.status === status && error.code === code && !error.message.includes('REMOTE SECRET'));
  }
  await assert.rejects(createClient({ fetch: async () => { throw Error('SECRET STACK'); } }).getInfo(), error => error instanceof MdprintError && error.code === 'network_error' && !error.message.includes('SECRET'));
});
test('response parsing checks content type, JSON, envelope and lists', async () => {
  for (const response of [new Response('{}'), new Response('{broken', { headers: { 'content-type': 'application/json' } }), json({ other: {} }), json(null)]) {
    await assert.rejects(createClient({ fetch: async () => response }).getInfo(), error => error.code === 'invalid_response');
  }
  await assert.rejects(createClient({ fetch: async () => json({ examples: {} }) }).listExamples(), error => error.code === 'invalid_response');
});
test('response length is bounded with and without a length header and stream is cancelled', async () => {
  await assert.rejects(createClient({ fetch: async () => new Response('{}', { headers: { 'content-type': 'application/json', 'content-length': '999999' } }) }).getInfo(), error => error.code === 'response_too_large');
  let canceled = false;
  const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(128 * 1024)); c.enqueue(new Uint8Array(1)); }, cancel() { canceled = true; } });
  await assert.rejects(createClient({ fetch: async () => new Response(stream, { headers: { 'content-type': 'application/json' } }) }).getInfo(), error => error.code === 'response_too_large');
  assert.equal(canceled, true);
});
test('timeout bounds both initial fetch and body reads', async () => {
  await assert.rejects(createClient({ timeoutMs: 10, fetch: () => new Promise(() => {}) }).getInfo(), error => error.code === 'timeout');
  let canceled = false;
  const stream = new ReadableStream({ cancel() { canceled = true; } });
  await assert.rejects(createClient({ timeoutMs: 10, fetch: async () => new Response(stream, { headers: { 'content-type': 'application/json' } }) }).getInfo(), error => error.code === 'timeout');
  assert.equal(canceled, true);
});
test('CLI emits JSON and meaningful exit codes, refusing conversion/unknown arguments', async () => {
  let out = '', err = '';
  const io = { stdout: { write: value => { out += value; } }, stderr: { write: value => { err += value; } }, fetch: async () => json({ product: { name: 'mdprint' }, sections: [] }) };
  assert.equal(await run(['info'], io), 0); assert.equal(JSON.parse(out).product.name, 'mdprint');
  for (const args of [['convert', 'private.md'], ['info', 'private.md'], ['docs', '--bad'], ['docs', '--base-url'], ['docs', '--base-url', 'http://evil.test']]) assert.equal(await run(args, io), 2);
  assert.equal(await run(['info'], { ...io, fetch: async () => new Response('', { status: 429 }) }), 1);
  assert.match(err, /HTTP 429/);
});
