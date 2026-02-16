# Samples Guide

The [samples/](../samples/) folder contains reference UI built with Tailwind (and Headless UI / Heroicons). Use it as the **single source** for typography, layout, and component patterns. Do not copy-paste JSX as-is; reimplement in TypeScript with RTL support.

## What’s in samples/

- **marketing/** – Heroes, testimonials, pricing, newsletter, logo clouds, stats, team sections
- **ecommerce/** – Product lists, checkout, carts, store navigation, reviews, order history
- **application-ui/** – Navbars, sidebars, tabs, modals, drawers, command palettes, forms

Samples are in **JSX** and **LTR**. Our app is **TypeScript** and **RTL (Farsi)**.

## How to Use

1. **Find a match** – Pick a sample that matches the section or component you need (e.g. hero, navbar, card list).
2. **Reuse typography** – Use the same Tailwind text and font classes (`text-sm/6`, `font-semibold`, `text-base/7`, heading sizes).
3. **Reuse layout** – Same containers and spacing: `max-w-7xl`, `px-4 sm:px-6 lg:px-8`, `mx-auto`, and similar patterns.
4. **Reimplement in TS + RTL** – Rewrite in TypeScript; replace directional utilities with logical ones (`ms-`/`me-`, `ps-`/`pe-`, `start`/`end`, `text-start`). Flip `left`/`right` and `ml`/`mr`/`pl`/`pr` as needed so the UI is correct in RTL.
5. **Integrate shadcn** – Use shadcn components (Button, Card, Dialog, etc.) where they fit; keep the overall look and spacing consistent with samples.

## RTL Adaptation

- **Margins/padding:** Prefer `ms-*`, `me-*`, `ps-*`, `pe-*` instead of `ml-*`, `mr-*`, `pl-*`, `pr-*`.
- **Alignment:** Use `text-start` / `text-end` instead of `text-left` / `text-right`.
- **Positioning:** Use `start-*` / `end-*` instead of `left-*` / `right-*`.
- **Borders:** Use `border-s` / `border-e` where direction matters.

The root layout already sets `<html lang="fa" dir="rtl">`; your components should use the logical utilities above so everything flips correctly.

## Don’t

- Copy-paste sample files into the app without converting to TypeScript and RTL.
- Introduce new typography or layout patterns that conflict with the samples.
- Use only directional classes (`ml`, `mr`, `left`, `right`) when logical equivalents exist.

For rule-level reminders, see `.cursor/rules/samples-ui.mdc` and `.cursor/rules/rtl-farsi.mdc`.
