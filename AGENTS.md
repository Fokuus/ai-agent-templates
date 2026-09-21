# Repository guide

This is an official Fokuus repository of agent documentation templates and the mdprint browser-workflow skill. The related browser tool is https://mdprint.app/. This repository does not contain the web application's source code or a conversion API.

## Editing

- Keep templates usable as plain Markdown. Retain placeholders where the user's actual information is needed; do not invent credentials, personal details, or results.
- Preserve fenced code, table structure, math and Mermaid syntax. Check relative links against real files. There is no application build in this repository.
- mdprint runs in the browser: import or paste Markdown and inspect the preview. Print → Save as PDF preserves selectable text where supported; Download PDF is a rasterized snapshot. Never claim these routes are identical.
- Do not put confidential document content in URLs or external API calls.
- Do not claim this repository is an SDK, MCP server, ChatGPT app, or the private mdprint source code.

## Agent skill

The real mdprint skill is `skills/mdprint/SKILL.md`; `templates/AGENTS.md` is an example document, not this repository's instructions. Keep skill claims aligned with the live browser tool. `plugin.json` bundles the skill using the Agent Plugins format; no MCP service is included.
