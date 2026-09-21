const DEFAULT_BASE = 'https://mdprint.app';
const MAX_RESPONSE_BYTES = 128 * 1024;
export class MdprintError extends Error {
  constructor(message, { code = 'request_failed', status } = {}) {
    super(message);
    this.name = 'MdprintError';
    this.code = code;
    if (status !== undefined) this.status = status;
  }
}
export function validateBaseUrl(value = DEFAULT_BASE) {
  let url;
  try { url = new URL(value); } catch { throw new MdprintError('Invalid base URL.', { code: 'invalid_base_url' }); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new MdprintError('Use an HTTPS origin or an HTTP loopback origin without credentials, paths, queries or fragments.', { code: 'invalid_base_url' });
  }
  return url.origin;
}
function checkedId(value) {
  if (typeof value !== 'string' || !/^[a-z][a-z-]{0,63}$/.test(value)) throw new MdprintError('Use a documentation ID such as basic or getting-started.', { code: 'invalid_id' });
  return value;
}
export function createClient({ baseUrl = DEFAULT_BASE, timeoutMs = 8000, fetch: fetcher = globalThis.fetch } = {}) {
  const base = validateBaseUrl(baseUrl);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) throw new MdprintError('timeoutMs must be between 1 and 30000.', { code: 'invalid_timeout' });
  if (typeof fetcher !== 'function') throw new MdprintError('Fetch is unavailable; use Node.js 20 or newer.', { code: 'invalid_fetch' });
  async function get(path, field) {
    const controller = new AbortController();
    let timer, reader;
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new MdprintError('Documentation request timed out.', { code: 'timeout' }));
      }, timeoutMs);
    });
    try {
      const response = await Promise.race([fetcher(`${base}${path}`, { method: 'GET', headers: { Accept: 'application/json' }, redirect: 'error', signal: controller.signal }), deadline]);
      if (!response.ok) throw new MdprintError(`Documentation request failed: HTTP ${response.status}.`, { status: response.status, code: response.status === 404 ? 'not_found' : response.status === 429 ? 'rate_limited' : 'http_error' });
      if (response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new MdprintError('Expected a JSON documentation response.', { code: 'invalid_response' });
      const length = response.headers.get('content-length');
      if (length && (!/^\d+$/.test(length) || Number(length) > MAX_RESPONSE_BYTES)) throw new MdprintError('Documentation response exceeds 128 KiB.', { code: 'response_too_large' });
      if (!response.body) throw new MdprintError('Empty documentation response.', { code: 'invalid_response' });
      reader = response.body.getReader();
      let size = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await Promise.race([reader.read(), deadline]);
        if (done) break;
        size += value.byteLength;
        if (size > MAX_RESPONSE_BYTES) throw new MdprintError('Documentation response exceeds 128 KiB.', { code: 'response_too_large' });
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      let data;
      try { data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
      catch { throw new MdprintError('Invalid JSON documentation response.', { code: 'invalid_response' }); }
      if (!data || typeof data !== 'object' || Array.isArray(data) || !Object.hasOwn(data, field)) throw new MdprintError('Unexpected documentation response.', { code: 'invalid_response' });
      if ((field === 'examples' || field === 'sections') && !Array.isArray(data[field])) throw new MdprintError('Unexpected documentation list.', { code: 'invalid_response' });
      return data;
    } catch (error) {
      if (error instanceof MdprintError) throw error;
      throw new MdprintError(controller.signal.aborted ? 'Documentation request timed out.' : 'Unable to reach mdprint documentation.', { code: controller.signal.aborted ? 'timeout' : 'network_error' });
    } finally {
      clearTimeout(timer);
      controller.abort();
      if (reader) { void reader.cancel().catch(() => {}); reader.releaseLock(); }
    }
  }
  return Object.freeze({
    getInfo: () => get('/api/v1/info', 'product'),
    listExamples: () => get('/api/v1/examples', 'examples'),
    getExample: id => get(`/api/v1/examples?id=${checkedId(id)}`, 'example'),
    listDocs: () => get('/api/v1/docs', 'sections'),
    getDoc: id => get(`/api/v1/docs?id=${checkedId(id)}`, 'section'),
  });
}
