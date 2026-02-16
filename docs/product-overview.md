# Product Overview

## Purpose

MasterPlan helps users **plan and run educational events**. The product supports people who want to organize an educational event and the teachers/instructors who deliver them.

## Target Users

- **Event planners** – People who want to plan and host an educational event (scheduling, content, resources).
- **Teachers / instructors** – Educators who need a panel to manage their events, see dates, and collaborate on planning.

## Core Value

- A **date-based panel** to help planners and teachers plan events, see timelines, and manage event-related data.
- All application data is stored in **JSON files** (no external database). The app reads from and writes to these files with strict care.
- The project is **documentation-first**: exporting data when needed and importing data are first-class features. Reliable import/export is essential.

## Out of Scope (for now)

- No dedicated database (e.g. PostgreSQL, MongoDB). JSON files are the single source of truth.
- No custom backend service for persistence; file-based JSON only.

## For the Agent

When adding features (e.g. new panel views, date filters, event forms), always align with this product context: educational events, planners + teachers, date-centric panel, and JSON-backed data with safe CRUD and import/export support.
