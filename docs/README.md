# Project Documentation Index

Project docs are written in English.

| Document | Description |
|----------|-------------|
| [product-overview.md](product-overview.md) | Product purpose: educational event planning; target users (planners, teachers); course-centric, date-based panel |
| [business-context.md](business-context.md) | **Entities** (Course, Session, SessionDetail, SessionFile) and **user flow / journey**; where they live in code |
| [data.md](data.md) | Data strategy: JSON files only; CRUD with high care; documentation-first; export and import; schema (courses.json, course-sessions, events.json) |
| [architecture.md](architecture.md) | High-level app structure, data flow, APIs, and key modules |
| [development.md](development.md) | Setup, scripts, data modules, API list, conventions, and data-handling |
| [samples-guide.md](samples-guide.md) | How to use the `samples/` folder for typography and components; RTL adaptation |

## For the Team

Start with [product-overview.md](product-overview.md) and [business-context.md](business-context.md) for domain and flow; then [data.md](data.md) and [architecture.md](architecture.md) for storage and APIs.

## For the Agent

When implementing features: follow [product-overview.md](product-overview.md) and [business-context.md](business-context.md); use [data.md](data.md) for schema and CRUD; prefer UI patterns from `samples/`; keep all documentation and code comments in English. See [AGENTS.md](../AGENTS.md) and `.cursor/rules/`.
