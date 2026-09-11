# Corville Design Document

## What is this?

A set of tools meant to simplify and streamline some of the tasks a referee (also called Dungeon Master/Game Master) will need to do when running Crows TTRPG.

_Note_: Crows hasn't yet released as a formal product and is still in the playtest stage. The tools created will use whatever content exists in the current playtest, with a goal of being able to support the full game contents when they eventually release.

## About Crows TTRPG

A fantasy RPG where PCs are adventurers brave or foolish enough to make a living (and a dying) by diving into monster-infested ruins for treasure. It uses the power roll mechanic from Draw Steel, but this is far from heroic fantasy.

Crows doesn’t care how powerful the adventurers are. What’s inside the dungeon is what’s inside the dungeon, and that doesn’t magically change based on the power level of the PCs. If they decide to poke a demon with a stick, that’s on them. If the characters enter a dungeon with a plan to run up to every threat and bash those baddies, the players will have to roll up new PCs right quick. This game’s math hasn’t been balanced to ensure players win most of the time. The monsters don’t plan to fight fair, so the players should do whatever they can to prepare for or avoid combat to survive. You need to use your WITS to survive!

Dungeon crawling in Crows is lethal and fun with straightforward rules. Tracking inventory, wounds, and light is actually tense and interesting. It doesn't feel like accounting. Your survival depends on it!

## Aesthetic

### Motifs

- Gothic
- Dark fanstasy
- Post-apocalyptic
- Grimdark
- Medieval
- Minimalist

### Color Palette

- black
- white
- grey
- blood red for accents (used minimally)

## Architecture

### Tech Stack

- html/css/typescript
- Vite (no framework)
- browser based webapp
- hosted on github pages

### Configuration

- Configuration files stored as JSON
- One config file each for items, monsters, rolled tables
- Browser localstorage used for permanence across sessions (post-MVP, should not be needed for initial feature set)

#### Rolled Table Schema

Each table entry in the rolled tables config follows this shape:

```json
{
  "id": "table-id",
  "name": "Display Name",
  "die": 6,
  "repeatDie": 4,
  "notes": "Optional referee notes shown alongside the table",
  "requiresInput": {
    "prompt": "Question to ask the user?",
    "options": ["option-a", "option-b"]
  },
  "inputChains": {
    "option-a": ["some-table-id"],
    "option-b": ["another-table-id"]
  },
  "results": [
    { "range": [1, 3], "text": "Result text", "description": "Optional extra context" },
    {
      "range": [4, 4],
      "text": "Single chain",
      "chain": "another-table-id"
    },
    {
      "range": [5, 5],
      "text": "Multiple chains",
      "chains": ["table-a", "table-b"]
    },
    {
      "range": [6, 6],
      "text": "Result referencing entities",
      "entityRef": "creature-id",
      "entityRefs": [{ "id": "creature-id", "count": "2d6" }]
    }
  ]
}
```

- `requiresInput` is optional; omit it for tables that need no user input before rolling
- `inputChains` maps each input option to a list of table IDs that are automatically chained when that option is selected
- `repeatDie` causes the chained table to be rolled that many times (e.g. `repeatDie: 4` rolls 1d4 times)
- `chain` (singular) and `chains` (array) on a result are optional; when present the tool automatically rolls those tables and appends results to the log
- `entityRef` / `entityRefs` link a result to one or more creatures or items in the data; the UI renders clickable links to their statblocks. `count` can be a fixed number or a dice expression string (e.g. `"2d6"`)
- `description` on a result is optional extra referee-facing context displayed alongside the result text
- `notes` on a table is optional metadata displayed with the table
- Chains can be multiple levels deep (max depth: 8)

### Layout/UI

- mobile first
- adaptive design
- mobile and laptop screens as main focus, everything else is post-MVP
- monsters/items/NPCs should display as easy to read tiles/cards

### Navigation

- Persistent tab bar with three tabs: **Tables**, **Lookup**, **Encounter**
- Tab bar is always visible regardless of active view

## MVP Scope

The following are in scope for MVP:

- Rolled Tables — full feature including chaining and session log
- Statblock Lookup — Creatures and Items lists with filter-as-you-type and detail view
- Tab bar navigation with Tables, Lookup, and Encounter tabs
- Encounter Builder — full feature
- Vite + TypeScript project hosted on GitHub Pages

The following are explicitly post-MVP:

- Browser localStorage persistence (module-level state currently preserves data within a session but not across page refreshes)
- Conditions on encounter creatures

## Core Features

_Note_: For the purposes of this doc, the term `creatures` refers to any no-PC entity. That could be wild animals, monsters, and human NPCs.

### Rolled Tables

- should be able to select a table to roll from (table values stored in config files)
- if a table requires inputs (i.e. overland travel tables depend on which kind of terrain/environment the PCs are in), then user input should be prompted before rolling
- should support table chains. e.g. if a table result requires rolling on a subsequent table, the tool should do that automatically. i.e. travel roll -> animal encounter roll -> animal behaviour roll

#### Logs

- UI should support in-window log of all table rolls made during current session
- this is important for keeping track of chained table rolls
- UI should occupy minial amount of real estate on screen, but can be expanded/collapsed

### Statblock Lookup

- Lookup is divided into two sub-lists: **Creatures** (monsters + NPCs) and **Items**
- Each list supports filter-as-you-type search
- Selecting an entry opens a full detail view (replaces the list; back button returns to list)
- Creature fields: name, size, power, type, stamina, speed, agility, mind, strength, attacks, features; animals and humans also have slots (inventory slots the creature occupies); humans also have AD, expertises, and equipment; monsters also have colloquial names, reactions (count), and an optional description
- Item fields: name, category (weapon/armor/ammo/consumable/magic/book/tool/gear/treasure), stack, slots, cost, optional description, optional crafting recipe (skill, materials, time); weapons also have range, attackStat, damage tiers (12-16 / 17+), keywords; armor has AD; ammo has ammoFor (weapon name) and optional ud; consumables and magic items have ud, maneuver/action text, and an optional RR table (≤11 / 12-16 / 17+); magic items also have an optional slot (body location); books have rank, school, actionType, range, target, duration, and an RR table; tools/gear have optional fine and masterwork upgrade descriptions; gear also supports maneuver/action text and an optional RR table

### Encounter Builder

- encounters track creatures; each creature card shows display name, current/max stamina, turn and reaction toggles
- if multiple identical creatures are added, their names get incrementing suffixes (e.g. "Rat 1", "Rat 2"), and the first is retroactively renamed when a second is added
- user can add creatures via a search panel; user can remove individual creatures from an encounter
- encounter state persists when switching tabs (module-level state — resets on page refresh)
- user can wipe the encounter clean and start fresh (with a confirmation prompt)
- user can adjust creature stamina with ± buttons (clamped to 0–max)
- creature card shows a disabled/greyed state when stamina reaches 0
- user can click a creature name to open its full statblock in a popup overlay
- user can mark a creature as having taken its turn (Turn toggle) or used its reaction (Reaction toggle)
- user can trigger a new round, which increments the round counter and resets all turn and reaction toggles
- post-MVP: applying conditions to creatures
