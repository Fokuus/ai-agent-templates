#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { realpathSync } from 'node:fs';
import { createClient, MdprintError } from './client.mjs';

const usage = `Read-only mdprint documentation client (does not convert files).
Usage: mdprint-docs <info|examples|docs> [id] [--base-url URL]
  info          Product identity, features and links
  examples [id] List examples, or read a curated example
  docs [id]     List documentation, or read a section
  --base-url    HTTPS origin, or HTTP loopback for local development
Exit codes: 0 success, 1 request/response failure, 2 invalid arguments.
`;
export async function run(argv, { stdout = process.stdout, stderr = process.stderr, fetch = globalThis.fetch } = {}) {
  const failUsage = message => { stderr.write(`${message}\n${usage}`); return 2; };
  if (argv.length === 0 || (argv.length === 1 && ['--help', '-h'].includes(argv[0]))) { stdout.write(usage); return 0; }
  const positional = [];
  let baseUrl;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--base-url') {
      if (baseUrl !== undefined || !argv[i + 1] || argv[i + 1].startsWith('-')) return failUsage('Provide --base-url once with a URL.');
      baseUrl = argv[++i];
    } else if (argv[i].startsWith('-')) return failUsage('Unknown option.');
    else positional.push(argv[i]);
  }
  const [command, id] = positional;
  if (!['info', 'examples', 'docs'].includes(command) || positional.length > 2 || (command === 'info' && id !== undefined)) return failUsage('Choose info, examples [id], or docs [id].');
  try {
    const client = createClient({ baseUrl, fetch });
    const value = command === 'info' ? await client.getInfo() : command === 'examples' ? await (id === undefined ? client.listExamples() : client.getExample(id)) : await (id === undefined ? client.listDocs() : client.getDoc(id));
    stdout.write(`${JSON.stringify(value, null, 2)}\n`);
    return 0;
  } catch (error) {
    if (error instanceof MdprintError && ['invalid_base_url', 'invalid_id', 'invalid_timeout', 'invalid_fetch'].includes(error.code)) return failUsage(error.message);
    stderr.write(`${error instanceof MdprintError ? error.message : 'Documentation request failed.'}\n`);
    return 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) process.exitCode = await run(process.argv.slice(2));
