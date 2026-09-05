# Corville — Implementation Tracker

## Project Overview

Corville is a browser-based referee tool for the Crows TTRPG — a dark fantasy dungeon-crawling game. The tool helps a referee (Game Master) run sessions by providing rolled tables, statblock lookup, and (eventually) an encounter builder.

- **Stack**: Vite + TypeScript, no framework, hosted on GitHub Pages
- **Aesthetic**: dark, minimal — black/grey/white with blood red accents
- **Full design doc**: `docs/design-doc.md`
- **Spec files**: `docs/planning/` (one file per milestone below)

---

## Milestones

Each milestone has a spec file with full task details, deliverables, and acceptance criteria. Work through them in order. Specs 02, 03, and 04 can run in parallel; 05 and 06 can run in parallel once 02–04 are done.

| # | Milestone | Spec | Status |
|---|-----------|------|--------|
| 01 | Project setup — Vite + TS scaffold, GitHub Pages, linting | [01-project-setup.md](01-project-setup.md) | [ ] Not started |
| 02 | Design system — CSS tokens, base styles, card/layout shell | [02-design-system.md](02-design-system.md) | [ ] Not started |
| 03 | Navigation — tab bar, view switcher, placeholder views | [03-navigation.md](03-navigation.md) | [ ] Not started |
| 04 | Data layer — TS types, JSON configs, stub data, loader | [04-data-layer.md](04-data-layer.md) | [ ] Not started |
| 05 | Rolled Tables — table selection, input prompting, chaining, session log | [05-rolled-tables.md](05-rolled-tables.md) | [ ] Not started |
| 06 | Statblock Lookup — filter-as-you-type list, detail view | [06-statblock-lookup.md](06-statblock-lookup.md) | [ ] Not started |

**To mark a milestone done**: change `[ ] Not started` to `[x] Done`.

---

## Post-MVP Backlog

These are out of scope until the MVP milestones above are complete.

- **Encounter Builder** — track creatures in an encounter, stamina management, disabled state at 0 stamina. See rough feature spec in `docs/design-doc.md` under "Encounter Builder (post MVP)".
- **Real creature/item data** — stub data in Spec 04 uses placeholder fields. Full field schema is defined in the Crows playtest PDF and needs to be transcribed into `src/data/creatures.json`, `src/data/items.json`, and the TypeScript types in `src/types/index.ts`.
- **Real rolled table data** — same as above; full tables need to be transcribed from the PDF into `src/data/tables.json`.
- **Browser localStorage persistence** — persist session state (current encounter, log) across page reloads.
- **Conditions tracking** — apply and display conditions on creatures in the Encounter Builder.

---

## Instructions for a Fresh Agent

1. Read this file to understand project state.
2. Read `docs/design-doc.md` for the full design context.
3. Find the lowest-numbered milestone with status `[ ] Not started` — that is your task.
4. Read its spec file carefully before writing any code.
5. When done, update this file: change the milestone's status to `[x] Done`.
