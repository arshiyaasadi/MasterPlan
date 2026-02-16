# Architecture

## Product Context

MasterPlan supports **planning and running educational events**. Target users are event planners and teachers/instructors. The app provides a **date-based panel** to help them plan events and manage schedules. See [product-overview.md](product-overview.md).

## Data Strategy

- **No dedicated database.** All persistent data is stored in **JSON files**. The application reads from and writes to these files only.
- **CRUD** on this data must be done with **very high care**: validation, error handling, and avoiding corruption or partial writes.
- **Documentation-first:** Export (getting data out) and import (bringing data in) are important. Data shapes and file formats should support reliable export/import. See [data.md](data.md).

## High-Level Structure

- **App:** Next.js App Router. Key areas: home, panel (date-based views for planners and teachers), and any future event/settings screens.
- **Data flow:** UI and API routes read from and write to the project JSON files. Client state (e.g. Zustand) is for UI only; persistence is file-based.
- **Panel:** Date-centric UI to help users plan events and see timelines. Design and implementation should follow `samples/` for layout and components (RTL, TypeScript).

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| JSON files only | No DB dependency; simple deployment; full control over format and location. |
| CRUD with high care | Prevents data loss and corruption; single source must stay consistent. |
| Documentation-first, export/import | Ensures data is understandable, portable, and recoverable. |
| RTL, Farsi | Product targets Persian-speaking users (planners, teachers). |

Update this file when new routes, data files, or architectural choices are introduced.
