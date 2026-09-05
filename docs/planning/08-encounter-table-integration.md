# Spec 08 — Table-to-Encounter Integration

## Goal

Link the Rolled Tables feature to the Encounter Builder: when a roll result references specific creatures, offer the referee a one-tap shortcut to add a creature individually or add all rolled creatures at once, then navigate to the Encounter tab.

## Context

`TableResult` already has an optional `entityRef?: string` field (see `src/types/index.ts`). This field holds a creature `id` matching an entry in `creatures.json`. When a roll result has `entityRef` set, it means the result implies a creature encounter.

## Deliverables

- Populate `entityRef` on applicable results in `src/data/tables.json`
- Add `getCreatureById` to `src/data/loader.ts`
- Update `src/components/RollResult.ts` to render per-creature CTAs and a top-level "Add all" button
- Wire navigation from CTAs to the Encounter tab (reuse the existing tab-switching mechanism)

## Behaviour

### Data (`tables.json`)

Audit `tables.json` for any result whose text names a specific creature. For each such result, add `"entityRef": "<creature-id>"` where `<creature-id>` matches the creature's `id` field in `creatures.json`.

Do not add `entityRef` to results that describe generic or non-specific outcomes (e.g. "no encounter", "strange noise", a general category like "undead").

### `RollResult` — CTA rendering

`RollResult` already renders recursively, so it has access to the full roll tree. Two levels of CTA are needed:

#### Per-creature CTA (on each chained result that has `entityRef`)

When `entry.result.entityRef` is set and a creature with that ID exists:

- Render a small button below the result text at that level:

  ```
  + Add [Creature Name] to Encounter
  ```

- Tapping adds that single creature via `addCreature(creature)` and switches to the Encounter tab

#### Top-level "Add all" button

At the outermost (non-chained) `RollResult` only, collect every `entityRef` from the entire roll tree — the primary result and all nested chains:

```ts
function collectEntityRefs(entry: RollEntry): string[] {
  const refs: string[] = []
  if (entry.result.entityRef) refs.push(entry.result.entityRef)
  for (const chain of entry.chains ?? []) refs.push(...collectEntityRefs(chain))
  return refs
}
```

- If `collectEntityRefs` returns 2 or more resolvable creatures: render an "Add all to Encounter" button above the per-creature CTAs (or at the bottom of the full result card — whichever reads more naturally)
- If it returns exactly 1, skip the "Add all" button (the individual CTA is sufficient)
- If it returns 0, render neither button

Tapping "Add all to Encounter":
1. Resolves each `entityRef` in the collected list via `getCreatureById`
2. Calls `addCreature` for each resolvable creature in order
3. Switches the active tab to "Encounter"

Unresolvable `entityRef` values (no matching creature) are silently skipped — do not throw or show an error.

### Tab switching

Use whatever mechanism `main.ts` already exposes for programmatic tab switching (e.g. a dispatched custom event, a direct call to the tab switcher, or a shared router function — look at the existing code and reuse the pattern).

## `loader.ts` addition

Add `getCreatureById` if it doesn't already exist:

```ts
export function getCreatureById(id: string): Creature | undefined
```

Looks up by `creature.id === id` in the loaded creatures array.

## CSS notes

- Per-creature CTAs and the "Add all" button use the existing `.btn` styles; use a smaller variant (`.btn--sm` or similar) if it exists
- Keep the CTAs visually subordinate to the result text — secondary actions on the card
- The "Add all" button can be slightly more prominent than the individual CTAs since it's the common case when multiple creatures are present

## Verify

- A single-level roll result with `entityRef` shows one per-creature CTA; no "Add all" button
- A chained roll where the chain has `entityRef` shows a per-creature CTA on the chained result, and — if the primary also has one — an "Add all" button at the top level
- Tapping "Add all" adds every creature in the roll tree to the encounter and switches tabs
- Individual per-creature CTAs still work when "Add all" is present
- Tapping any CTA switches to the Encounter tab and the creature(s) appear there
- An unresolvable `entityRef` is silently skipped — no crash, no empty CTA

## References

- Design doc: "Encounter Builder (post MVP)" — the first bullet on table-to-encounter prompting
- `src/types/index.ts` — `TableResult.entityRef` is already defined
- `src/data/tables.json` — add `entityRef` values here
- `src/data/loader.ts` — add `getCreatureById` helper
- `src/components/RollResult.ts` — add the CTA rendering
- `src/state/encounter.ts` — call `addCreature` (from Spec 07)
- Spec 07 must be complete before this spec runs
