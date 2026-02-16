# Development

*(Placeholder: to be filled by the team.)*

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

## Data Handling

- **Single source:** All persistent data is in JSON files. Do not introduce a database or other storage. See [data.md](data.md).
- **CRUD:** Implement create/read/update/delete with high care: validate before write, handle errors, avoid partial or corrupted writes. Document file locations and schemas.
- **Export/import:** Design data and features so that exporting needed data and importing data are supported and documented. Keep formats and behavior clear for the agent and future maintainers.

Add project-specific conventions here as they are adopted.
