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
- Renders fields in a structured layout based on creature type (see below)

**Common header** (all creatures):
```
[Name]                    [Type badge]
Size: Medium  Power: 4    Stamina: 15
Speed: 6      Agility: 1  Mind: 2  Strength: 0
```

**Attacks table** (all creatures): name, range, tier 2 damage (12-16), tier 3 damage (17+)

**Features list** (all creatures): each feature as a heading + description block; show `uses` next to the name if present (e.g. "Fire Beam — 1/Day")

**Human-only fields** (rendered after attacks):
- AD (if present)
- Expertises (comma-separated list)
- Equipment (comma-separated list)

**Monster-only fields**:
- Colloquial names (if present), rendered as italic subtitle below the name
- Reactions (if not 1), shown in the header row

**Item detail** — render by `category` using type guards (`entity.category === 'weapon'` etc.):

*weapon*: name, keywords as badges, `range`, `attackStat`, damage table (12-16 | 17+ rows), `slots`, `stack`, crafting if present, cost

*armor*: name, `AD: N` badge, `slots`, `stack`, crafting if present, cost

*ammo*: name, `ammoFor`, `ud` if present, cost

*consumable*: name, `ud` if present, maneuver text if present, action text if present, RR table (≤11 | 12-16 | 17+) if present, crafting if present, cost

*magic*: name, slot badge if present, `ud` if present, maneuver/action text, RR table if present, crafting if present, cost

*book*: name, rank badge (e.g. "R0"), school, action type, range, target if present, duration, `ud`, RR table if present, cost

*tool*: name, description if present, Fine upgrade text if present, Masterwork upgrade text if present, crafting if present, cost

*gear*: name, description if present, maneuver text if present, action text if present, RR table if present, Fine if present, Masterwork if present, crafting if present, cost

*treasure*: name, description if present (value and type are ref-determined)

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
  entity: Creature | Item
  onBack: () => void
}
```

Renders the structured layout described above. Use `'type' in entity` to discriminate between `Creature` and `Item` at the top level. For creatures, use `entity.type === 'Human'` etc. For items, use `entity.category === 'weapon'` etc. to select the correct rendering path.

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
