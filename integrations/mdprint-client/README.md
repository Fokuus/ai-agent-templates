# @fokuus/mdprint-client

A small JavaScript SDK and command-line client for mdprint's **public, read-only documentation API**. Read product capabilities, documentation and curated Markdown examples. **This package does not convert Markdown to PDF**, upload files, or provide the private mdprint renderer.

Node.js 20 or newer is required. No API key, account or runtime dependency is needed. Install the official archive directly (npm registry publication is not required):

```sh
npm install https://mdprint.app/developers/downloads/fokuus-mdprint-client-0.1.0.tgz
npx mdprint-docs info
```

This is a website-hosted release, not a claim of an npm registry listing.

## Run from source

```sh
node cli.mjs info
node cli.mjs examples
node cli.mjs examples tables
node cli.mjs docs privacy
```

After installation, the executable is `mdprint-docs` from `@fokuus/mdprint-client`. The default API origin is `https://mdprint.app`. This package does not start an API server.

For a local development server that exposes the same public documentation API:

```sh
node cli.mjs docs --base-url http://127.0.0.1:4340
```

## JavaScript

From this source checkout:

```js
import { createClient } from './client.mjs';
const mdprint = createClient();
console.log(await mdprint.getInfo());
console.log(await mdprint.listExamples());
console.log((await mdprint.getExample('basic')).example.markdown);
console.log(await mdprint.listDocs());
console.log((await mdprint.getDoc('getting-started')).section.content);
```

After installation, import `createClient` from `@fokuus/mdprint-client` instead. TypeScript declarations are included. Methods return the server's JSON envelope unchanged.

| Method | Public route | Result |
| --- | --- | --- |
| `getInfo()` | `GET /api/v1/info` | Product identity, privacy, features, limits and links |
| `listExamples()` | `GET /api/v1/examples` | `{ examples: [{ id, title, description }] }` |
| `getExample(id)` | `GET /api/v1/examples?id=...` | `{ example: { id, title, description, markdown } }` |
| `listDocs()` | `GET /api/v1/docs` | `{ sections: [{ id, title, summary }] }` |
| `getDoc(id)` | `GET /api/v1/docs?id=...` | `{ section: { id, title, summary, content, url } }` |

Example IDs: `basic`, `tables`, `tasks`. Documentation IDs: `getting-started`, `privacy`, `capabilities`, `integrations`. Unknown IDs return an error; use the list methods rather than guessing.

## Bounds and errors

`createClient({ baseUrl, timeoutMs, fetch })` optionally changes the origin, timeout or fetch implementation. Origins must use HTTPS, except exact HTTP loopback hosts (`localhost`, `127.0.0.1`, `[::1]`). Credentials, paths, query strings and fragments in a base URL are rejected. Redirects are rejected rather than followed to another origin.

Requests time out after 8 seconds by default (configurable up to 30 seconds). Responses are capped at 128 KiB while streaming, even without a Content-Length header. The SDK only sends GET requests to the documented routes. There are no file-reading methods, uploads, private service calls, telemetry or automatic retries. Rate-limit responses must be handled by the caller.

Failures use `MdprintError` with a `code` and an HTTP `status` when available. CLI output is JSON on stdout; errors go to stderr. Exit codes: `0` success, `1` request/response failure, `2` invalid arguments. `--help` prints usage. The CLI accepts `info`, `examples [id]`, and `docs [id]`, plus `--base-url URL`.

The [mdprint browser app](https://mdprint.app/) remains the document-conversion interface. Its Print → Save as PDF option preserves selectable text; Download PDF makes an image-based copy. See [developer documentation](https://mdprint.app/developers/) for privacy and export limits.

## Source and license

Official public source: [Fokuus/ai-agent-templates — integrations/mdprint-client](https://github.com/Fokuus/ai-agent-templates/tree/main/integrations/mdprint-client). The package contains only this HTTP client and CLI, declarations, and documentation. The MIT license applies to this wrapper package; it does not license mdprint's private application or conversion implementation.

Run `npm test` for isolated mock-response tests. `npm pack --dry-run --json` displays the package allowlist before release. No install hooks or runtime dependencies are used.
