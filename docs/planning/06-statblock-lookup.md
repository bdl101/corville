# Spec 06 — Statblock Lookup

## Goal

Implement the full Lookup view: tabbed Creatures/Items lists with filter-as-you-type search and a detail view for individual entries.

## Deliverables

- `src/views/LookupView.ts` — full Lookup view (replaces placeholder from Spec 03)
- `src/components/EntityList.ts` — filterable list of creatures or items
- `src/components/EntityCard.ts` — compact list card for an entity
- `src/components/EntityDetail.ts` — full detail view for a selected entity

## Behaviour

### Lookup View

- Two tabs within the Lookup view: **Creatures** and **Items**
- These are sub-tabs inside the view, distinct from the main nav tab bar
- Default active sub-tab: Creatures
- Switching sub-tabs resets the search filter

### Entity List

- A text input at the top of the list for filter-as-you-type search
- Filter matches against entity `name` (case-insensitive, substring match)
- Results update on every keystroke with no debounce needed (list is small, all in-memory)
- If the filter produces no matches, show an empty state message (e.g. "No results")
- Each entity is shown as a card with its name; tapping opens the detail view

### Entity Detail View

- Replaces the list (full view swap, not a side panel)
- Shows a back button at the top to return to the list (restores previous filter state)
- Displays all available fields for the entity
- Since full field definitions are TBD (pending PDF review), render fields generically: iterate the entity object's keys and display each as a labelled row
- Skip rendering `id` as it is an internal field

### Empty/Stub State

- Stub data from Spec 04 will have minimal fields (name + id only)
- The detail view should still render usefully with sparse data — e.g. just the name as a heading and a note that full stats are pending

## Component Structure

### `EntityList`

```ts
interface EntityListProps<T extends { id: string; name: string }> {
  entities: T[]
  onSelect: (entity: T) => void
}
```

Generic over entity type so it works for both Creatures and Items without duplication.

Renders:
- Search input (`.input`)
- Filtered list of `EntityCard` components
- Empty state message when filter yields no results

### `EntityCard`

```ts
interface EntityCardProps {
  name: string
  onClick: () => void
}
```

Renders a `.card` with the entity name and a right-facing chevron or similar affordance indicating it is tappable.

### `EntityDetail`

```ts
interface EntityDetailProps {
  entity: Record<string, unknown>
  onBack: () => void
}
```

Renders:
- Back button at the top
- Entity name as a heading (`h2`)
- Each non-`id` field as a labelled row:
  ```
  [Field Label]   [Field Value]
  ```
- Fields with object or array values should be rendered as JSON for now (pending real schema)

### `LookupView`

Manages:
- Active sub-tab (`creatures` | `items`)
- Current filter string (reset on sub-tab change)
- Selected entity (null when showing list, set when showing detail)

State transitions:
```
List view → (tap card) → Detail view
Detail view → (tap back) → List view (filter restored)
```

## Verify

- Typing in the search input filters the list in real time
- Clearing the input restores the full list
- Tapping a card opens the detail view
- The back button returns to the list with the filter state preserved
- Switching between Creatures and Items tabs shows the correct list and clears the filter
- No results message appears when the filter matches nothing

## References

- Design doc: Statblock Lookup section
- Specs 02, 03, and 04 must be complete before this spec runs
