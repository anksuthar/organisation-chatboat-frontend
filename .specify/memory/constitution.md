<!--
Sync Impact Report
- Version change: template → 1.0.0 (initial ratification)
- Principles defined:
  I. BFF Security Boundary (NON-NEGOTIABLE)
  II. Layered Data Access
  III. Contract-First with the Backend
  IV. Test Every User Story (E2E, mocked backend)
  V. Pinned Stack & Base UI Conventions
  VI. Simplicity
- Added sections: Security & Configuration Constraints, Development Workflow & Quality Gates
- Removed sections: none
- Templates:
  ✅ .specify/templates/plan-template.md — "Constitution Check" is derived from this file; no edit needed
  ✅ .specify/templates/spec-template.md — no mandatory-section change required
  ✅ .specify/templates/tasks-template.md — E2E test tasks per user story already supported
  ✅ CLAUDE.md — runtime guidance consistent with these principles
- Deferred TODOs: none
-->

# Organisation Chatboat Frontend Constitution

## Core Principles

### I. BFF Security Boundary (NON-NEGOTIABLE)

- The FastAPI JWT MUST live only in the httpOnly `session` cookie. Client-side code MUST NOT
  read, store, or forward the raw token (no `localStorage`, no non-httpOnly cookies, no JS
  access).
- All browser → backend traffic MUST go through `app/api/backend/[...path]/route.ts` (or
  `app/api/auth/*` for session lifecycle). Client code MUST NOT call the FastAPI URL directly.
- `BACKEND_URL` and any other secret MUST be server-only (read via `lib/env.ts`) and MUST NOT be
  prefixed with `NEXT_PUBLIC_`.
- `middleware.ts` role checks are UX routing only; FastAPI is the authorization authority.
  A feature MUST NOT rely on frontend role checks as its only protection.
- The proxy MUST stream request and response bodies unbuffered (multipart uploads, SSE chat).

Rationale: the backend issues a bearer JWT with no cookie support; the BFF is what keeps that
token out of reach of XSS.

### II. Layered Data Access

- Dependency direction is fixed: `app/**` pages/components → `hooks/use-*.ts` →
  `services/*.ts` → `services/api-client.ts` → `/api/backend/*`.
- Each backend resource gets one `services/<resource>.ts` wrapper and one `types/<resource>.ts`
  module. Pages and components MUST NOT call `api-client`/`axios`/`fetch` directly.
- Request/response server state MUST use React Query hooks with explicit cache invalidation on
  mutations. Streaming endpoints (e.g. chat SSE) are the only exception and MUST be isolated in
  a dedicated hook (see `hooks/use-chat-stream.ts`).
- Forms MUST use react-hook-form + zod schemas for validation.

Rationale: one predictable path per data flow keeps features reviewable and testable.

### III. Contract-First with the Backend

- Every feature spec that touches the API MUST list the backend endpoints it uses in
  `specs/<feature>/contracts/` (method, path, request/response shape, error codes), taken from
  the backend OpenAPI (`/docs`) of `../organisation-chatboat-backend`.
- `types/*.ts` MUST match those contracts. When a feature needs an endpoint that does not exist
  yet, the spec MUST say so and link the corresponding backend spec/issue; the frontend MUST NOT
  invent response shapes.
- Contract changes are breaking until proven otherwise and MUST be called out in the plan.

Rationale: the E2E suite mocks the backend, so the contract docs are the only guard against
frontend/backend drift.

### IV. Test Every User Story (E2E, mocked backend)

- Every user story in a spec MUST have at least one Playwright test in `tests/e2e/` covering its
  acceptance scenarios, including role-gating where the story is role-restricted.
- Tests MUST mock `/api/backend/*` and `/api/auth/*` with `page.route()` using fixtures that
  match the documented contracts (Principle III). Tests MUST NOT depend on a live backend.
- Locators MUST use `{ exact: true }` whenever the target text can be a substring of other
  on-page text.
- Before a release, a manual smoke pass against the real backend MUST be performed for any
  feature whose contracts changed.

Rationale: fast, deterministic tests for frontend logic; contracts + smoke pass cover the rest.

### V. Pinned Stack & Base UI Conventions

- Next.js MUST stay on major version 15 (App Router, TypeScript strict). Major upgrades of
  `next`, `react`, or `@base-ui/react` require their own spec.
- shadcn/ui here is Base UI-based: compose with the `render` prop, never `asChild`; handle the
  `null` case of Base UI `onValueChange`. `components/ui/form.tsx` is hand-written and MUST NOT
  be regenerated with `npx shadcn add form`.
- `turbopack.root` in `next.config.ts` MUST be kept.
- New UI primitives come from `components/ui` (shadcn/Base UI) before adding a new UI library.

Rationale: these choices are load-bearing and have already caused breakage when ignored.

### VI. Simplicity

- Build only what the current spec's user stories require (YAGNI). No speculative abstractions,
  global state stores, or new dependencies without a justification recorded in the plan's
  Complexity Tracking table.
- Prefer server components and route handlers already in place over new infrastructure.

## Security & Configuration Constraints

- Real `.env*` files MUST NOT be committed; only `*.example` templates are shared.
- Playwright traces/reports (`test-results/`, `playwright-report/`) MUST NOT be committed.
- User-generated or model-generated content (chat answers, document text) MUST be rendered
  through `react-markdown` without enabling raw HTML.
- No secrets, tokens, or PII in client-side logs or error toasts.

## Development Workflow & Quality Gates

- Workflow per feature: `/speckit-specify` → `/speckit-clarify` (when ambiguous) →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`.
- Feature directories use sequential numbering: `specs/NNN-short-name/`, one git branch per
  feature with the same name.
- Merge gates (all MUST pass): `npx tsc --noEmit`, `npm run lint`, `npm run build`,
  `npm run test:e2e`.
- Features spanning frontend and backend MUST have a spec in each repo, cross-linked; the
  backend contract is agreed before frontend implementation starts.

## Governance

- This constitution supersedes ad-hoc conventions. `/speckit-plan` Constitution Check gates and
  code review MUST verify compliance; deviations MUST be justified in the plan's Complexity
  Tracking table or the constitution amended first.
- Amendments: change this file via PR, include an updated Sync Impact Report, and bump the
  version — MAJOR for removed/redefined principles, MINOR for new principles or materially
  expanded guidance, PATCH for clarifications.
- Runtime, environment-specific guidance lives in `CLAUDE.md` and `README.md`; keep them
  consistent with this file.

**Version**: 1.0.0 | **Ratified**: 2026-11-16 | **Last Amended**: 2026-11-16
