# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Next.js 15 (App Router, TypeScript) frontend for the Enterprise AI Knowledge Base RAG system.
Backend is the sibling `../organisation-chatboat-backend` repo (FastAPI, has its own CLAUDE.md). See `README.md` here
for full architecture — don't duplicate that here.

## Commands

```bash
source ~/.nvm/nvm.sh && nvm use 20   # Node isn't on PATH by default in this environment
npm install
npm run dev                          # Turbopack dev server
npm run build                        # production build (also type-checks)
npx tsc --noEmit                     # type-check only, faster than a full build
npm run lint                         # ESLint
npm run test:e2e                     # Playwright — mocked backend, no live FastAPI needed
npx playwright test tests/e2e/chat.spec.ts   # single file
```

## Known environment gotchas

- **Pin Next.js to v15, not `@latest`.** `create-next-app@latest` installs whatever is newest
  (this repo was scaffolded when that was Next 16) — the project spec calls for Next 15
  specifically. If re-scaffolding anything or bumping `next`, check this still matters.
- **shadcn/ui here is Base UI-based, not Radix.** No `asChild` prop anywhere — use the `render`
  prop instead: `<Button render={<Link href="/x" />}>label</Button>`. `Select`'s
  `onValueChange` is typed `(value: string | null, ...) => void` (Base UI), not the classic
  Radix `(value: string) => void` — handle the `null` case even if it can't realistically occur
  in a given usage. `components/ui/form.tsx` is hand-written (not registry-served in this shadcn
  version) using `React.cloneElement`, not a Slot primitive — don't replace it with
  `npx shadcn add form`, it currently resolves to zero files from the registry.
- **Docker/Playwright system deps need sudo**, which this environment's user doesn't have
  passwordless access to. `npx playwright install chromium` (browser binary only, no
  `--with-deps`) works without sudo and was sufficient to run the suite headless here — don't
  assume `--with-deps` is available.
- **The E2E suite never talks to a real backend** — every `/api/backend/*` and `/api/auth/*`
  call is mocked via Playwright `page.route()`. This is deliberate (fast, deterministic, no
  infra dependency) but means the suite can't catch backend contract drift — see README's
  Testing section before treating a green suite as full release confidence.
- **`getByText`/`getByRole(..., {name})` default to case-insensitive substring matching** in
  Playwright — pass `{ exact: true }` whenever the target text is also a substring of something
  else on the page (this bit the "Processing" status badge test, which also matched a toast
  containing "processing started", and a table-cell accessible-name test where the actions
  cell's concatenated aria-labels contained the target name as a substring).
