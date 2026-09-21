# AI agent templates and mdprint skill

Markdown templates for setting up and documenting AI coding agents: an `AGENTS.md` for a
repo, a system prompt, a tool/function spec, and a project context file.

They are plain Markdown, so they live next to your code, render on GitHub, and read well in
any editor. To hand one to a teammate as a clean PDF (onboarding, a review, an appendix),
paste it into [mdprint.app](https://mdprint.app) and export. It runs in your browser, keeps
tables and code blocks, and nothing is uploaded.

## Official mdprint skill

Use the [mdprint skill](skills/mdprint/SKILL.md) to prepare Markdown and choose the right browser export workflow. It covers local import, math and diagrams, PDF checks, and the difference between Print and Download PDF. No API key or account is needed. It requires a browser for conversion; the included documentation MCP server cannot convert documents.

Install it in a supported coding agent with the Skills CLI:

```sh
npx skills add Fokuus/ai-agent-templates --skill mdprint
```

This command installs the skill; it does not register an account or guarantee a skills.sh directory listing. This repository also includes a [Agent Plugins manifest](plugin.json) and [read-only MCP configuration](mcp.json), for clients that support that format. Client support varies.

The [repository guide](AGENTS.md) tells coding agents how to work with these templates. The mdprint web application's source code is not part of this repository. The similarly named npm/PyPI packages are unrelated. Our [documentation SDK and CLI](integrations/mdprint-client/) contain only a small public API client, not the conversion implementation. See [mdprint developer documentation](https://mdprint.app/developers/) for WebMCP browser tools and installation.

## Templates

| File | Use for |
|------|---------|
| [`templates/AGENTS.md`](templates/AGENTS.md) | Repo-level instructions for a coding agent |
| [`templates/system-prompt.md`](templates/system-prompt.md) | A reusable system prompt scaffold |
| [`templates/tool-spec.md`](templates/tool-spec.md) | Documenting a tool the agent can call |
| [`templates/project-context.md`](templates/project-context.md) | Background an agent should know |

## What is AGENTS.md?

A short Markdown file at the root of a repository that tells an AI coding agent how to work
in it: the build and test commands, the conventions to follow, and the boundaries to respect.
Keep it factual, current, and short. Agents read it the way a new contributor reads a
CONTRIBUTING guide.

## License

MIT. Use and adapt freely.

Built by [Fokuus](https://mdprint.app).
