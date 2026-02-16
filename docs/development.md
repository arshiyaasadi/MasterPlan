# Development

## Setup

- Node and pnpm (see root [README](../README.md))
- No external database; data lives in project JSON files (see [data.md](data.md))
- Environment variables: add as needed (e.g. for future export paths or feature flags)

## Scripts

- `pnpm dev` – Start development server
- `pnpm build` – Production build
- `pnpm start` – Start production server
- `pnpm lint` – Run ESLint

## Conventions

- TypeScript strict mode
- Components and UI patterns follow `samples/`; see [samples-guide.md](samples-guide.md)
- RTL and Farsi: root layout uses `lang="fa"` and `dir="rtl"`; use logical CSS utilities
- All documentation and code comments in English

## Data Modules

- **lib/courses.ts** – Types (`Course`, `SessionDetail`, `SessionFile`, `CoursesData`) and pure helpers (`getTotalHours`, `createId`, `isValidCourseName`). Safe to import from client and server.
- **lib/courses-server.ts** – Server-only: `readCoursesData`, `writeCoursesData`, `getCoursesFilePath`, `getCourseSessionsDir`. Used only by API routes. **Do not import from client code** (uses Node `fs` and `path`).

## API List

- **Courses:** GET/POST `/api/courses`; PATCH `/api/courses/[id]` (name, description, hoursPerSession, durationDays, selectedDates, sessionTimes, sessionDetails).
- **Session files:** POST `/api/courses/[id]/session-files` (upload); GET/DELETE `/api/courses/[id]/session-files/[fileId]` (download, delete).
- **Events:** GET/POST `/api/events`; PATCH/DELETE `/api/events/[id]` (present; not used by main course/session flow). See [architecture.md](architecture.md) for details.

## Data Handling

- **Single source:** All persistent data is in JSON files (and `data/course-sessions/<courseId>/` for uploads). Do not introduce a database or other storage. See [data.md](data.md).
- **CRUD:** Implement create/read/update/delete with high care: validate before write, handle errors, avoid partial or corrupted writes. Document file locations and schemas.
- **Export/import:** Design data and features so that exporting needed data and importing data are supported and documented. Keep formats and behavior clear for the agent and future maintainers.
