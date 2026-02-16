# MasterPlan

Base project for MasterPlan: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Motion, and Zustand. The app is Persian (Farsi) and uses RTL layout.

## Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI:** shadcn/ui
- **Animation:** Motion (framer-motion)
- **State:** Zustand
- **Package manager:** pnpm

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- **`app/`** – Next.js App Router (layouts, pages, routes)
- **`components/`** – App-specific components (follow patterns from `samples/`)
- **`components/ui/`** – shadcn/ui components
- **`lib/`** – Utilities and shared logic
- **`store/`** – Zustand stores
- **`data/`** – JSON data files (`courses.json`, `events.json`) and `data/course-sessions/<courseId>/` for session file uploads
- **`samples/`** – Reference UI components (Tailwind-based); use as the source for typography and UX patterns
- **`docs/`** – Project documentation (architecture, development, samples guide)

## Documentation

- [docs/README.md](docs/README.md) – Index of project docs
- [docs/product-overview.md](docs/product-overview.md) – Product purpose: educational event planning; planners and teachers; course-centric, date-based panel
- [docs/business-context.md](docs/business-context.md) – Entities (Course, Session, SessionDetail, SessionFile) and user flow / journey
- [docs/data.md](docs/data.md) – Data strategy: JSON only; CRUD with high care; export/import; schema (courses.json, course-sessions, events.json)
- [docs/architecture.md](docs/architecture.md) – High-level architecture, APIs, and data flow
- [docs/development.md](docs/development.md) – Setup, data modules, API list, conventions, and data-handling
- [docs/samples-guide.md](docs/samples-guide.md) – How to use the samples folder for UI development

## Agent and Rules

See [AGENTS.md](AGENTS.md) for the Cursor agent role and sources of truth. Project rules live in `.cursor/rules/` (English-only, full-stack agent, samples-based UI, RTL/Farsi, JSON-only data with careful CRUD and export/import).
