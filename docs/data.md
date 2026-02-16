# Data Strategy

## Single Source: JSON Files

The project **does not use a dedicated database**. All persistent data lives in **JSON files**. The application reads from and writes to these files. Every feature that needs persistent data must go through this JSON layer.

## Principles

1. **Single source of truth** – All application data is stored in JSON. No separate DB, no mixed storage.
2. **CRUD with high care** – Create, read, update, and delete operations on this data must be implemented with **very high attention**: validation, atomicity where possible, error handling, and avoiding corruption or partial writes.
3. **Documentation-first** – The project prioritizes documentation. Data structures, file locations, and CRUD contracts must be documented. Export and import behavior must be clear and reliable.
4. **Export and import** – Exporting data (for backup, reporting, or integration) and importing data (for setup or migration) are important. Design data shapes and file formats with export/import in mind.

## Data Files

### courses.json

**Path:** `data/courses.json`

**Purpose:** List of courses (educational events) and their setup, session dates, times, and per-session details (including file metadata).

**Schema:** `{ "courses": Course[] }` where each **Course** has:

- **id** (string), **name** (string)
- **description**? (string), **hoursPerSession**? (number), **durationDays**? (number)
- **selectedDates**? (string[]): Jalali date keys `YYYY-MM-DD` for session days (from Jalali calendar). Total hours = hoursPerSession × durationDays.
- **sessionTimes**? (Record<string, string>): `dateKey` → `"HH:mm"` (session start time).
- **sessionDetails**? (Record<string, SessionDetail>): `dateKey` → **SessionDetail**:
  - **title**? (string), **description**? (string)
  - **files**? (**SessionFile**[]): **id** (string), **savedName** (string, unique on disk), **originalName** (string), **description**? (string). Binary files live under `data/course-sessions/<courseId>/`; only metadata is in JSON.

**API:** `GET /api/courses`, `POST /api/courses` (add by name), `PATCH /api/courses/[id]` (update name, description, hoursPerSession, durationDays, selectedDates, sessionTimes, sessionDetails).

### File storage: course-sessions

**Path:** `data/course-sessions/<courseId>/`

**Purpose:** Session file uploads for a course. One folder per course. Files are stored with unique names (e.g. `<id>.<ext>`). Metadata (originalName, description) lives in `courses.json` under `course.sessionDetails[dateKey].files`. API: `POST /api/courses/[id]/session-files` (upload), `GET /api/courses/[id]/session-files/[fileId]` (download), `DELETE /api/courses/[id]/session-files/[fileId]` (remove file and metadata).

### events.json

**Path:** `data/events.json`

**Purpose:** Calendar events (legacy/general). Schema: `{ "events": [ { "id", "date" (Jalali YYYY-MM-DD), "title", "description"?, "time"?, "courseId"? } ] }`. API: `GET /api/events`, `POST /api/events`, `PATCH /api/events/[id]`, `DELETE /api/events/[id]`.

**Note:** The main course/session flow does **not** use events. The Jalali calendar uses `course.selectedDates` and `course.sessionDetails` for the selected course. events.json and the events API exist for reference or future use; they are not used by the current calendar UI.

## Expectations (No Code Here)

- **Location and shape** – Where JSON files live and their schema will be defined as the app is built. Docs and rules refer to “the project JSON” as the single data source.
- **CRUD** – Any code that creates, updates, or deletes data in these files must follow project best practices: validate before write, handle errors, avoid concurrent write conflicts, and document behavior.
- **Export** – When “getting data out” is required, the app should support exporting the needed data (e.g. events, schedules, user-related data) in a documented format (e.g. JSON, CSV) from the same JSON source.
- **Import** – When “bringing data in” is required, the app should support importing data into the project JSON with validation and clear rules (overwrite, merge, or reject). Document the expected format and behavior.

## For the Agent

- Do not introduce a database or another persistent store; keep JSON as the only persistence.
- When implementing or designing CRUD: validate inputs, handle errors, document file layout and schemas, and consider export/import from the start.
- Update [architecture.md](architecture.md) and this doc when data file locations or schemas are added or changed.
