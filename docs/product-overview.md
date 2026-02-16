# Product Overview

## Purpose

MasterPlan helps users **plan and run educational events**. The product supports people who want to organize an educational event and the teachers/instructors who deliver them.

## Target Users

- **Event planners** – People who want to plan and host an educational event (scheduling, content, resources).
- **Teachers / instructors** – Educators who need a panel to manage their events, see dates, and collaborate on planning.

## Core Value

- The app is **course-centric**: a course has a list of session dates; each session can have a start time, title, description, and attached files. The main flow is: plan course → set session dates in the calendar → set times and per-session details → view overview (progress, next session, completion).
- A **date-based panel** helps planners and teachers plan events, see timelines, and manage event-related data.
- All application data is stored in **JSON files** (no external database). The app reads from and writes to these files with strict care.
- The project is **documentation-first**: exporting data when needed and importing data are first-class features. Reliable import/export is essential.

For **domain entities** (Course, Session, SessionDetail, SessionFile) and the **user flow / journey**, see [business-context.md](business-context.md).

## Out of Scope (for now)

- No dedicated database (e.g. PostgreSQL, MongoDB). JSON files are the single source of truth.
- No custom backend service for persistence; file-based JSON only.

## For the Agent

When adding features (e.g. new panel views, date filters, event forms), always align with this product context: educational events, planners + teachers, date-centric panel, and JSON-backed data with safe CRUD and import/export support.
