# AGENTS.md

Instructions for AI coding agents working in this repository. Keep this short and current.

## Project

One or two lines on what this project is and what it does.

## Setup

```bash
# install dependencies
npm install
```

## Build, run, test

```bash
npm run build      # produce a build
npm run dev        # local development
npm test           # run the test suite
```

Always run the tests before proposing a change as done.

## Conventions

- Language and formatter: e.g. TypeScript, Prettier. Match the surrounding code.
- Commits: short, imperative subject lines.
- Branches: `feat/<name>`, `fix/<name>`.

## Boundaries

- Do not commit secrets. Configuration with real values stays out of git.
- Do not push to the default branch without a review.
- Ask before changing anything that affects production.

## Where things live

- `src/` — application code
- `tests/` — test suite
- `docs/` — documentation
