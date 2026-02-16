# Architecture

## Product Context

MasterPlan supports **planning and running educational events**. Target users are event planners and teachers/instructors. The app provides a **date-based panel** to help them plan events and manage schedules. See [product-overview.md](product-overview.md).

## Data Strategy

- **No dedicated database.** All persistent data is stored in **JSON files**. The application reads from and writes to these files only.
- **CRUD** on this data must be done with **very high care**: validation, error handling, and avoiding corruption or partial writes.
- **Documentation-first:** Export (getting data out) and import (bringing data in) are important. Data shapes and file formats should support reliable export/import. See [data.md](data.md).

## High-Level Structure

- **App:** Next.js App Router. Key areas: home (course list, course setup, Jalali calendar for session dates and details), and any future event/settings screens.
- **Data flow:** UI and API routes read from and write to project JSON files and the `data/course-sessions/<courseId>/` folder. The **main flow** uses `data/courses.json` and session file uploads; `data/events.json` exists but is not used by the calendar. Client state (e.g. React state, Zustand) is for UI only; persistence is file-based.
- **Panel:** Date-centric UI: course list → course setup (description, hours, duration) → Jalali calendar (select session dates, set times, add per-session details and files) → overview. Design and implementation follow `samples/` (RTL, TypeScript).

## APIs (Current)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/courses` | GET | List all courses. |
| `/api/courses` | POST | Create course (body: `{ name }`). |
| `/api/courses/[id]` | PATCH | Update course: name, description, hoursPerSession, durationDays, selectedDates, sessionTimes, sessionDetails. |
| `/api/courses/[id]/session-files` | POST | Upload file (formData: file, dateKey, originalName?, description?). Appends to sessionDetails[dateKey].files; stores file in `data/course-sessions/<id>/`. |
| `/api/courses/[id]/session-files/[fileId]` | GET | Download file (returns file body). |
| `/api/courses/[id]/session-files/[fileId]` | DELETE | Remove file from sessionDetails and delete from disk. |
| `/api/events` | GET, POST | Events API (exists; not used by main course/session flow). |
| `/api/events/[id]` | PATCH, DELETE | Event by id (exists; not used by main flow). |

## Key Modules

- **[lib/courses.ts](../lib/courses.ts)** – Types (`Course`, `SessionDetail`, `SessionFile`, `CoursesData`) and pure helpers (`getTotalHours`, `createId`, `isValidCourseName`). Client-safe; no Node or file I/O.
- **[lib/courses-server.ts](../lib/courses-server.ts)** – Server-only: `readCoursesData`, `writeCoursesData`, `getCoursesFilePath`, `getCourseSessionsDir`. Used only by API routes; do not import from client code.
- **[lib/jalali.ts](../lib/jalali.ts)** – Jalali (Shamsi) date handling: formatting, parsing, calendar helpers. Used by client components.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| JSON files only | No DB dependency; simple deployment; full control over format and location. |
| CRUD with high care | Prevents data loss and corruption; single source must stay consistent. |
| Documentation-first, export/import | Ensures data is understandable, portable, and recoverable. |
| RTL, Farsi | Product targets Persian-speaking users (planners, teachers). |

Update this file when new routes, data files, or architectural choices are introduced.
