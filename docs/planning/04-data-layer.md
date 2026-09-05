# Spec 04 — Data Layer

## Goal

Define the TypeScript types for all game data, create the JSON config file structure, and write stub data so subsequent specs have something to render.

## Deliverables

- `src/types/index.ts` — all shared TypeScript types
- `src/data/tables.json` — rolled tables config (with 2–3 example tables including a chain)
- `src/data/creatures.json` — creature data (5–10 stubs)
- `src/data/items.json` — item data (5–10 stubs)
- `src/data/loader.ts` — typed functions to load/access each config

## Notes on stub data

Creature and item field definitions are **TBD** — the full schema will be defined when the Crows playtest PDF is reviewed. For now, stubs should use a `[field: string]: unknown` escape hatch alongside any fields that are already known (name, id). The `loader.ts` functions should be written against the final types, not the stubs, so they don't need changing when real data is added.

## TypeScript Types (`src/types/index.ts`)

### Rolled Tables

```ts
export interface TableInput {
  prompt: string
  options: string[]
}

export interface TableResult {
  range: [number, number]  // inclusive [min, max]
  text: string
  chain?: string           // id of table to auto-roll next
}

export interface RolledTable {
  id: string
  name: string
  die: number              // number of faces on the die (e.g. 6 for d6)
  requiresInput?: TableInput
  results: TableResult[]
}
```

### Creatures

```ts
export interface Creature {
  id: string
  name: string
  // Full field list TBD — to be populated from playtest PDF
  [key: string]: unknown
}
```

### Items

```ts
export interface Item {
  id: string
  name: string
  // Full field list TBD — to be populated from playtest PDF
  [key: string]: unknown
}
```

## JSON Config Files

### `src/data/tables.json`

Provide at least three example tables:
1. A simple table with no input and no chain (e.g. "Weather")
2. A table that requires input before rolling (e.g. "Overland Travel" — prompts for terrain type)
3. A table that chains to another (e.g. a result that triggers an "Animal Encounter" sub-table)

The chain example should demonstrate at least two levels of depth.

### `src/data/creatures.json`

Array of 5–10 creature stubs with `id` and `name` fields populated. Other fields can be placeholder strings or omitted. Names should be thematic to dark fantasy (e.g. "Cave Rat", "Hollow Knight", "Plague Hound").

### `src/data/items.json`

Array of 5–10 item stubs with `id` and `name` fields populated. Names should be thematic (e.g. "Tallow Candle", "Rope (50ft)", "Iron Rations (3 days)").

## Data Loader (`src/data/loader.ts`)

Typed accessor functions that import the JSON files and return typed arrays:

```ts
import tablesData from './tables.json'
import creaturesData from './creatures.json'
import itemsData from './items.json'

export function getTables(): RolledTable[] { ... }
export function getTableById(id: string): RolledTable | undefined { ... }
export function getCreatures(): Creature[] { ... }
export function getItems(): Item[] { ... }
```

Enable JSON imports in `tsconfig.json` with `"resolveJsonModule": true`.

## Verify

- `npm run build` passes without type errors
- `getTableById` correctly resolves a chain by referencing another table's `id`
- Stub data is importable and typed correctly in the browser console during dev

## References

- Design doc: Configuration section and Rolled Table Schema
- Design doc: Statblock Lookup (Creatures and Items)
- Spec 01 must be complete before this spec runs (can run in parallel with Specs 02 and 03)
