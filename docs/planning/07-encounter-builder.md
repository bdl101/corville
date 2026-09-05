# Spec 07 — Encounter Builder

## Goal

Implement the full Encounter Builder: an in-memory state layer for tracking creatures through a combat encounter, and the Encounter view that exposes all encounter controls.

## Deliverables

- `src/types/encounter.ts` — encounter-specific types
- `src/state/encounter.ts` — in-memory encounter state store with subscriber pattern
- `src/views/EncounterView.ts` — full Encounter view (replaces the placeholder from Spec 03)
- `src/components/EncounterCreatureCard.ts` — compact per-creature card with controls
- `src/components/AddCreaturePanel.ts` — searchable panel for adding a creature to the encounter

## Types (`src/types/encounter.ts`)

```ts
export interface EncounterCreature {
  uid: string            // unique instance ID (crypto.randomUUID() or Date.now() + Math.random())
  creatureId: string     // references Creature.id in creatures.json
  displayName: string    // e.g. "Goblin", "Goblin 1", "Goblin 2" — set at add time, never changed
  maxStamina: number     // from Creature.stamina at the time of adding
  currentStamina: number // starts at maxStamina; clamped to [0, maxStamina]
  hasTakenTurn: boolean  // reset to false each new round
  hasUsedReaction: boolean // reset to false each new round
}

export interface EncounterState {
  creatures: EncounterCreature[]
  round: number          // starts at 1; increments on newRound
}
```

## State Store (`src/state/encounter.ts`)

Module-level singleton — state persists as long as the page is loaded, surviving tab switches.

```ts
import { Creature } from '../types'
import { EncounterCreature, EncounterState } from '../types/encounter'

export function getState(): EncounterState
export function subscribe(listener: () => void): () => void   // returns unsubscribe fn
export function addCreature(creature: Creature): void
export function removeCreature(uid: string): void
export function adjustStamina(uid: string, delta: number): void
export function setTurn(uid: string, taken: boolean): void
export function setReaction(uid: string, used: boolean): void
export function newRound(): void
export function clearEncounter(): void
```

### Function specifications

**`addCreature(creature)`**

Count how many `EncounterCreature` entries in the current state share `creatureId === creature.id`:

- If count is 0: `displayName = creature.name` (no number suffix)
- If count is 1: rename the existing one's `displayName` to `creature.name + " 1"`, set new one's `displayName` to `creature.name + " 2"`
- If count ≥ 2: new one's `displayName` is `creature.name + " " + (count + 1)`

Set `maxStamina` and `currentStamina` to `creature.stamina`. Set both booleans to `false`. Push to state.

**`removeCreature(uid)`** — remove the entry with that uid. Does not renumber remaining entries.

**`adjustStamina(uid, delta)`** — add `delta` (may be negative) to `currentStamina`, clamp result to `[0, maxStamina]`.

**`setTurn(uid, taken)`** — set `hasTakenTurn` on the matching entry.

**`setReaction(uid, used)`** — set `hasUsedReaction` on the matching entry.

**`newRound()`** — increment `round` by 1, set `hasTakenTurn` and `hasUsedReaction` to `false` on all creatures.

**`clearEncounter()`** — reset state to `{ creatures: [], round: 1 }`.

**`subscribe(listener)`** — every mutation must call all registered listeners after updating state. Return a cleanup function that removes that listener.

## Behaviour

### Encounter View

- Renders current encounter state from the store; re-renders whenever the store notifies
- **Header bar**: "Round N" label on the left; "New Round" button and "Clear" button on the right
- **Body**: if `creatures` is empty, show an empty state: "No creatures in this encounter." with an "Add Creature" button centred below
- **Body**: if `creatures` is non-empty, show the list of `EncounterCreatureCard` components, followed by an "Add Creature" button at the bottom
- **Clear** button: shows a confirmation prompt (e.g. `window.confirm`) before calling `clearEncounter()`; re-renders after

### EncounterCreatureCard

Shows a compact card for one `EncounterCreature`. Layout:

```
[×]  Goblin 2              [hasTakenTurn toggle]  [hasUsedReaction toggle]
     Stamina: 8 / 12       [−]  [+]
```

- **Remove button (×)**: calls `removeCreature(uid)`
- **Name**: tapping the creature name opens its full statblock in an overlay — reuse `EntityDetail` from Spec 06. The overlay must have a close/back button
- **Turn toggle**: a button or checkbox labelled "Turn" (or a sword icon); visually active when `hasTakenTurn` is true; calls `setTurn(uid, !hasTakenTurn)`
- **Reaction toggle**: a button or checkbox labelled "Reaction" (or a shield icon); visually active when `hasUsedReaction` is true; calls `setReaction(uid, !hasUsedReaction)`
- **Stamina controls**: "−" calls `adjustStamina(uid, -1)`, "+" calls `adjustStamina(uid, +1)`. The "−" should be disabled when `currentStamina === 0`; "+" should be disabled when `currentStamina === maxStamina`
- **Disabled state**: when `currentStamina === 0`, the card receives a `.disabled` modifier class — visually muted/greyed out. The stamina controls and toggles can still be interacted with (so the referee can undo a mistake), but the card must be unmistakably visually distinct

### AddCreaturePanel

An inline panel or overlay that appears when the "Add Creature" button is tapped:

- Text input for filter-as-you-type (case-insensitive substring match on creature `name`)
- Scrollable list of matching creatures; each row shows name, type, and stamina (e.g. "Goblin — Blood — 12 HP")
- Tapping a row calls `addCreature(creature)` and closes the panel
- A "Close" or "×" button dismisses the panel without adding anything

## Component Structure

### `EncounterView`

Manages:
- Subscription to the encounter store (subscribe on mount, unsubscribe on teardown)
- Panel visibility (AddCreaturePanel open/closed)
- Full-stats overlay (which creature, if any, is shown)

### `EncounterCreatureCard`

Props: `creature: EncounterCreature`, `onRequestDetail: (creatureId: string) => void`

Calls store mutation functions directly — no prop callbacks for stamina/turn/reaction changes.

### `AddCreaturePanel`

Props: `allCreatures: Creature[]`, `onClose: () => void`

Calls `addCreature` directly on selection.

## CSS notes

- `.encounter-creature-card.disabled` — muted background, reduced opacity on name and stats. Keep controls visible but the card should read as inactive at a glance
- Turn and reaction toggles should have a clear active state (filled/coloured vs outline)
- Use the existing design tokens; no new colours beyond what's already defined

## Verify

- Adding a single creature shows it with its plain name and full stamina
- Adding two of the same creature renames both with "1" and "2" suffixes
- Removing a creature removes it from the list immediately
- Stamina increments and decrements correctly; buttons disable at bounds
- A creature at 0 stamina shows the disabled card style
- Turn and reaction toggles change state and persist until "New Round" is triggered
- "New Round" increments the round counter and resets all turn/reaction flags
- "Clear" (after confirmation) empties the list and resets round to 1
- The full statblock overlay opens on name tap and closes with its back/close button
- The Add Creature panel filters the creatures list correctly and adds on selection
- Navigating away to Tables or Lookup and back preserves the encounter state

## References

- Design doc: "Encounter Builder (post MVP)" section
- `src/types/index.ts` — existing `Creature` type (use `creature.stamina` for starting stamina)
- `src/components/EntityDetail.ts` — reuse for the full statblock overlay
- `src/data/loader.ts` — use existing `getCreatures()` to populate AddCreaturePanel
- Specs 02, 03, and 04 must be complete before this spec runs; Spec 06 must be done for EntityDetail reuse
