# Specs index

Spec-driven docs (GitHub Spec Kit) for the frontend. Project rules:
[`.specify/memory/constitution.md`](../.specify/memory/constitution.md).

## Layout

One folder per feature, one sub-folder per sub-feature:

```
NNN-feature/
  spec.md  plan.md  contracts/     # feature overview, shared design, backend endpoints used
  NN-sub-feature/
    spec.md  plan.md  tasks.md     # user stories, implementation plan, tasks
```

In `tasks.md`: `[X]` = implemented (verified against the cited file), `[ ] … GAP:` = required by
the spec/constitution but missing in code. Every feature spec here was written retroactively from
existing code (2026-11-16); contracts are derived from frontend code and Playwright mocks — items
marked **UNVERIFIED** still need checking against the backend OpenAPI.

## Features

| Feature | Sub-specs | Done | Gaps |
|---|---|---|---|
| [001 Platform Foundation](001-platform-foundation/spec.md) | [01 BFF proxy](001-platform-foundation/01-bff-proxy/spec.md) · [02 API client](001-platform-foundation/02-api-client/spec.md) · [03 App shell & navigation](001-platform-foundation/03-app-shell-navigation/spec.md) · [04 Theming & fallback pages](001-platform-foundation/04-theming-and-fallback-pages/spec.md) | 38 | 17 |
| [002 Authentication & Role-Based Access](002-authentication/spec.md) | [01 Login](002-authentication/01-login/spec.md) · [02 Session & logout](002-authentication/02-session-and-logout/spec.md) · [03 Role-based routing](002-authentication/03-role-based-routing/spec.md) | 40 | 15 |
| [003 Knowledge-Base Categories](003-knowledge-categories/spec.md) | [01 Browse](003-knowledge-categories/01-browse-categories/spec.md) · [02 Create & edit](003-knowledge-categories/02-create-edit-category/spec.md) · [03 Delete](003-knowledge-categories/03-delete-category/spec.md) | 31 | 8 |
| [004 Document Management](004-document-management/spec.md) | [01 List](004-document-management/01-document-list/spec.md) · [02 Upload](004-document-management/02-document-upload/spec.md) · [03 Detail](004-document-management/03-document-detail/spec.md) · [04 Actions](004-document-management/04-document-actions/spec.md) · [05 Admin dashboard](004-document-management/05-admin-dashboard/spec.md) | 52 | 27 |
| [005 Knowledge Chat](005-knowledge-chat/spec.md) | [01 Streaming answers](005-knowledge-chat/01-streaming-answers/spec.md) · [02 Citations & fallback](005-knowledge-chat/02-grounding-citations-fallback/spec.md) · [03 History & clear](005-knowledge-chat/03-conversation-history/spec.md) · [04 Markdown & copy](005-knowledge-chat/04-markdown-rendering/spec.md) · [05 Agent result cards](005-knowledge-chat/05-agent-actions/spec.md) | 42 | 12 |
| [006 Commerce](006-commerce/spec.md) | [01 Product-category admin](006-commerce/01-product-category-admin/spec.md) · [02 Product admin](006-commerce/02-product-admin/spec.md) · [03 Shop browse](006-commerce/03-shop-browse/spec.md) · [04 Cart & checkout](006-commerce/04-cart-checkout/spec.md) · [05 Orders](006-commerce/05-orders/spec.md) | 55 | 46 |
| [007 Support Tickets](007-support-tickets/spec.md) | [01 Ticket list](007-support-tickets/01-ticket-list/spec.md) · [02 Ticket detail](007-support-tickets/02-ticket-detail/spec.md) | 14 | 6 |
| [008 Profile & Settings](008-profile-settings/spec.md) | [01 Profile](008-profile-settings/01-profile/spec.md) · [02 Appearance](008-profile-settings/02-settings-appearance/spec.md) | 13 | 7 |
| **Total** | **29 sub-specs** | **285** | **138** |

## New features

Run `/speckit-specify <description>` — it creates the next `specs/NNN-name/`. Then
`/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`.
Split large features into `NN-sub-feature/` folders following the layout above.
