# Spec 05 — Rolled Tables

## Goal

Implement the full Tables view: table selection, optional user input prompting, die rolling, chain resolution, and the collapsible session log.

## Deliverables

- `src/views/TablesView.ts` — full Tables view (replaces placeholder from Spec 03)
- `src/components/TableSelector.ts` — list of available tables
- `src/components/InputPrompt.ts` — modal/inline prompt for tables that require input
- `src/components/RollResult.ts` — displays the result of a roll (and any chained results)
- `src/components/SessionLog.ts` — collapsible log of all rolls in the current session
- `src/logic/roller.ts` — die rolling and chain resolution logic

## Behaviour

### Table Selection

- The Tables view shows a list of all available tables loaded from `tables.json`
- Each table is shown as a tappable card displaying its name
- Tapping a table initiates a roll (or prompts for input first if required)

### Input Prompting

- If the selected table has a `requiresInput` field, show a prompt before rolling
- The prompt displays the `prompt` string and the list of `options` as selectable buttons
- Once the user selects an option, proceed to roll
- The selected option is stored and passed through to the result display and log

### Rolling

- Roll a random integer in `[1, die]` (inclusive)
- Find the `TableResult` whose `range: [min, max]` contains the rolled value
- Display the result text

### Chain Resolution

- If the matched result has a `chain` field, automatically look up that table by ID and roll it
- Append the chained result below the primary result
- Continue resolving chains recursively until a result has no `chain`
- Each level of the chain should be visually distinct (indented or labelled) so the user can follow the sequence

### Session Log

- Every completed roll sequence (primary + all chained results) is appended to the session log as a single entry
- Each log entry shows: table name, roll value, result text, and any chained results
- The log panel occupies minimal screen space by default — collapsed to a single header line (e.g. "Session Log (4 rolls)")
- Tapping the header expands/collapses the full log
- The log is in-memory only (cleared on page reload); no persistence

## Logic (`src/logic/roller.ts`)

```ts
import { RolledTable, TableResult } from '../types'
import { getTableById } from '../data/loader'

export interface RollEntry {
  table: RolledTable
  rolledValue: number
  result: TableResult
  input?: string          // selected input option if table required one
  chain?: RollEntry       // recursively nested chained roll
}

export function rollTable(table: RolledTable, input?: string): RollEntry
export function resolveChain(result: TableResult): RollEntry | undefined
```

`rollTable` should:
1. Roll `Math.ceil(Math.random() * table.die)`
2. Find the matching `TableResult`
3. Recursively call `resolveChain` if a `chain` is present
4. Return a fully resolved `RollEntry`

## Component Structure

### `TableSelector`

Props: `tables: RolledTable[]`, `onSelect: (table: RolledTable) => void`

Renders the list of table cards. No state of its own.

### `InputPrompt`

Props: `input: TableInput`, `onConfirm: (selected: string) => void`

Renders the prompt text and option buttons. Can be shown inline below the selected card or as a simple overlay — keep it minimal.

### `RollResult`

Props: `entry: RollEntry`

Renders the roll result recursively. Each level shows:
- Table name
- "Rolled X on dY"
- Result text
- If chained: a nested `RollResult` for the chained entry, visually indented

### `SessionLog`

Props: `entries: RollEntry[]`

Renders the collapsible log. Collapsed state shows entry count. Expanded state shows all entries in reverse-chronological order (most recent at top).

## Verify

- Tapping a table with no input immediately shows a result
- Tapping a table with input shows the prompt; selecting an option then shows the result
- A chained table auto-rolls and shows the chained result nested below the primary result
- Multi-level chains (A → B → C) resolve fully and display correctly
- Each roll is appended to the session log
- The session log collapses and expands correctly
- The log header count is accurate

## References

- Design doc: Rolled Tables and Logs sections
- Specs 02, 03, and 04 must be complete before this spec runs
