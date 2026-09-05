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
  "requiresInput": {
    "prompt": "Question to ask the user?",
    "options": ["option-a", "option-b"]
  },
  "results": [
    { "range": [1, 3], "text": "Result text" },
    { "range": [4, 6], "text": "Result with chain", "chain": "another-table-id" }
  ]
}
```

- `requiresInput` is optional; omit it for tables that need no user input before rolling
- `chain` on a result is optional; when present the tool automatically rolls the referenced table and appends its result to the log
- Chains can be multiple levels deep

### Layout/UI

- mobile first
- adaptive design
- mobile and laptop screens as main focus, everything else is post-MVP
- monsters/items/NPCs should display as easy to read tiles/cards

### Navigation

- Persistent tab bar with three tabs: **Tables**, **Lookup**, **Encounter**
- Tab bar is always visible regardless of active view
- Encounter tab is present in the nav but non-functional until Encounter Builder is implemented (post-MVP)

## MVP Scope

The following are in scope for MVP:

- Rolled Tables — full feature including chaining and session log
- Statblock Lookup — Creatures and Items lists with filter-as-you-type and detail view
- Tab bar navigation with Tables, Lookup, and Encounter tabs (Encounter is non-functional)
- Vite + TypeScript project hosted on GitHub Pages

The following are explicitly post-MVP:

- Encounter Builder
- Browser localStorage persistence

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
- Creature fields: name, size, power, type, stamina, speed, agility, mind, strength, attacks, features; humans also have AD, expertises, and equipment; monsters also have colloquial names and reactions
- Item fields: name, category (weapon/armor/ammo/consumable/magic/book/tool/gear/treasure), stack, slots, cost; weapons also have range, attackStat, damage tiers (12-16 / 17+), keywords; armor has AD; consumables and magic items have ud, maneuver/action text, and an optional RR table (≤11 / 12-16 / 17+); books have rank, school, actionType, range, target, duration, and an RR table; tools/gear have optional fine and masterwork upgrade descriptions

### Encounter Builder (post MVP)

- rolled tables that lead to encounters should prompt user, asking if they want to create an encounter using the values from the rolled table
- encounters only need to track creatures
- if multiple identical creatures are added, they should have incrementing numbers next to their name
- user should be able to add or remove creatures from an encounter
- user should be able to exit and re-enter encounter UI without losing state of current encounter
- user should be able to wipe an encounter clean and start a fresh one
- user should be able to track creature stamina
- user should be able to add/remove creature stamina
- creature UI should show disabled state if stamina reaches 0 or below
- creature UI should be minimal (show bare minimum info), but user should be able to select creature to see full stats
- post-post-MVP: user should be able to apply a condition to creatures and have it be obvious in the UI
