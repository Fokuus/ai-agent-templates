# AI agent templates

Markdown templates for setting up and documenting AI coding agents: an `AGENTS.md` for a
repo, a system prompt, a tool/function spec, and a project context file.

They are plain Markdown, so they live next to your code, render on GitHub, and read well in
any editor. To hand one to a teammate as a clean PDF (onboarding, a review, an appendix),
paste it into [mdprint.app](https://mdprint.app) and export. It runs in your browser, keeps
tables and code blocks, and nothing is uploaded.

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
