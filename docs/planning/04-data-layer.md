# Spec 04 — Data Layer

## Goal

Define the TypeScript types for all game data, create the JSON config file structure, and populate real creature and table data from the Crows playtest PDF so subsequent specs have accurate content to render.

## Deliverables

- `src/types/index.ts` — all shared TypeScript types
- `src/data/tables.json` — rolled tables config (real tables from the playtest PDF)
- `src/data/creatures.json` — creature data (real statblocks from the playtest PDF)
- `src/data/items.json` — item data (stub — schema TBD from items PDF)
- `src/data/loader.ts` — typed functions to load/access each config

---

## TypeScript Types (`src/types/index.ts`)

### Rolled Tables

```ts
export interface TableInput {
  prompt: string
  options: string[]
}

export interface TableResult {
  range: [number, number]   // inclusive [min, max]
  text: string
  chain?: string            // id of a single table to auto-roll next
  chains?: string[]         // ids of multiple tables to auto-roll in sequence
}

export interface RolledTable {
  id: string
  name: string
  die: number               // number of faces on the die (e.g. 6 for d6, 100 for d100)
  requiresInput?: TableInput
  results: TableResult[]
  notes?: string            // optional playtest note shown to the user
}
```

### Creatures

Creatures are split into three distinct types based on entity type. Each extends a shared base.

```ts
export type CreatureSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge'
export type CreatureType = 'Animal' | 'Human' | 'Blood' | 'Undead' | 'Angel' | 'Demon' | 'Plant' | 'Unique'

export interface Attack {
  name: string        // e.g. "Bite (+2)"
  bonus: number       // attack bonus number
  range: string       // e.g. "Melee 1", "Ranged 10", "Melee 1 (2 tar)"
  tier2: string       // damage on a 12-16 result, e.g. "3 dam"
  tier3: string       // damage on a 17+ result, e.g. "5 dam"
  note?: string       // footnote key if the attack has a special effect (e.g. "*Lacerate")
}

export interface Feature {
  name: string
  description: string
  uses?: string       // e.g. "1/Day", "3/Day", "1/Rest" — omit if unlimited
}

interface BaseCreature {
  id: string
  name: string
  size: CreatureSize
  power: number
  type: CreatureType
  stamina: number
  speed: string       // e.g. "6", "6, climb 6", "6, fly 6 (U)"
  agility: number
  mind: number
  strength: number
  attacks: Attack[]
  features: Feature[]
}

export interface AnimalCreature extends BaseCreature {
  type: 'Animal'
  slots: number
}

export interface HumanCreature extends BaseCreature {
  type: 'Human'
  slots: number
  ad?: string         // e.g. "2 (from knife)", "5 (light armor)"
  expertises: string[]
  equipment: string[]
}

export interface MonsterCreature extends BaseCreature {
  type: 'Blood' | 'Undead' | 'Angel' | 'Demon' | 'Plant' | 'Unique'
  reactions?: number  // defaults to 1 if omitted
  colloquialNames?: string[]
  description?: string
}

export type Creature = AnimalCreature | HumanCreature | MonsterCreature
```

### Items

Items are split into distinct categories via a discriminated union. Each extends a shared base.

```ts
export type ItemCategory =
  | 'weapon' | 'armor' | 'ammo'
  | 'consumable' | 'magic' | 'book'
  | 'tool' | 'gear' | 'treasure'

export interface RRTable {
  tier1?: string   // ≤11 result; omit when the lowest bracket is 12-16
  tier2: string    // 12-16 result
  tier3: string    // 17+ result
}

export interface CraftingRecipe {
  skill: string      // e.g. "Blacksmithing 1", "Alchemy 2"
  materials: string  // e.g. "1 iron bar", "2 monster parts (any)"
  time: number       // as printed on card
}

interface BaseItem {
  id: string
  name: string
  stack: number          // max per inventory slot
  slots: number          // inventory slots it occupies (default 1)
  category: ItemCategory
  cost?: number          // gold coins; omit when price is not fixed
  description?: string
  crafting?: CraftingRecipe
}

export interface WeaponItem extends BaseItem {
  category: 'weapon'
  attackStat: 'A' | 'S' | 'A or S'
  range: string          // e.g. "Melee 1", "Melee 1/Ranged 5", "Ranged 20"
  tier2: string          // damage at 12-16, e.g. "3 + S"
  tier3: string          // damage at 17+
  keywords: string[]     // e.g. ["Bashing", "Light", "Pummeling"]
}

export interface ArmorItem extends BaseItem {
  category: 'armor'
  ad: number
}

export interface AmmoItem extends BaseItem {
  category: 'ammo'
  ud?: string
  ammoFor: string        // e.g. "shortbows and longbows"
}

export interface ConsumableItem extends BaseItem {
  category: 'consumable'
  ud?: string
  maneuver?: string
  action?: string
  rrTable?: RRTable
}

export interface MagicItem extends BaseItem {
  category: 'magic'
  slot?: string          // "Ring" | "Neck" | "Head"
  ud?: string
  maneuver?: string
  action?: string
  rrTable?: RRTable
}

export interface BookItem extends BaseItem {
  category: 'book'
  rank: number           // 0 = R0, 1 = R1, etc.
  school: string         // "Alteration" | "Benefaction" | "Conjuration" | "Elemental" | "Illusion" | "Necromancy"
  actionType: string     // "Maneuver" | "Action" | "Attack"
  range: string
  target?: string
  duration: string
  rrTable?: RRTable
}

export interface ToolItem extends BaseItem {
  category: 'tool'
  fine?: string
  masterwork?: string
}

export interface GearItem extends BaseItem {
  category: 'gear'
  maneuver?: string
  action?: string
  rrTable?: RRTable
  fine?: string
  masterwork?: string
}

export interface TreasureItem extends BaseItem {
  category: 'treasure'
}

export type Item =
  | WeaponItem | ArmorItem | AmmoItem
  | ConsumableItem | MagicItem | BookItem
  | ToolItem | GearItem | TreasureItem
```

---

## JSON Config Files

### `src/data/tables.json`

Populate with real tables from the playtest PDF. At minimum include:

1. **Travel Encounters** (`travel-encounters`, d100) — top-level overland table; results chain to sub-tables
2. **Any Monster Encounter** (`any-monster-encounter`, d10) — chains to dungeon-specific encounter tables
3. **Blood Dungeon Encounters** (`blood-dungeon-encounters`, d6) — encounter table for blood creatures
4. **Undead Dungeon Encounters** (`undead-dungeon-encounters`, d10) — encounter table for undead
5. **Wild Animal Reaction** (`wild-animal-reaction`, d100) — rolled after any wild animal encounter
6. **Coastal Animal Encounters** (`coastal-animal-encounters`, d10)
7. **Cold Climate Animal Encounters** (`cold-climate-animal-encounters`, d10)
8. **Desert Animal Encounters** (`desert-animal-encounters`, d100)
9. **Forest Animal Encounters** (`forest-animal-encounters`, d100)
10. **Grassland Animal Encounters** (`grassland-animal-encounters`, d100)
11. **Hill/Mountain Animal Encounters** (`hill-mountain-animal-encounters`, d100)
12. **Marsh/Swamp Animal Encounters** (`marsh-swamp-animal-encounters`, d10)
13. **Traveler Encounters** (`traveler-encounters`, d10)
14. **Traveler Rewards** (`traveler-rewards`, d6)
15. **Miasma-Touched Humans** (`miasma-touched-humans`, d100)
16. **Miasma-Touched Encounters** (`miasma-touched-encounters`, d100)
17. **Merchant Sales** (`merchant-sales`, d100)
18. **Merchant Guards** (`merchant-guards`, d10)
19. **Travelers** (`travelers`, d100)
20. **Minor Interesting Things** (`minor-interesting-things`, d100)
21. **Major Interesting Things** (`major-interesting-things`, d100)

**Chain complexity notes** — some chains in the real tables are more complex than a simple `chain` field:

- **Wild Animal** result in Travel Encounters chains to a habitat-specific animal table, which requires knowing the terrain. Model this as a `chain` to a table with `requiresInput` (habitat selection). The tool will prompt for habitat before rolling the sub-table.
- **Miasma-Touched** result chains to two tables in sequence: first roll on Miasma-Touched Humans (to get who is present), then roll on Miasma-Touched Encounters (to get their attitude). Model this with `chains: ["miasma-touched-humans", "miasma-touched-encounters"]`.
- **Traveler** result similarly chains to two tables: Travelers (who) + Traveler Encounters (what's happening). Use `chains`.
- **Any Monster** chains to a dungeon-specific encounter table. Since that table is determined by the Any Monster Encounter roll, the chain is indirect — model the Any Monster Encounter result text as naming the target table, and use `chain` to point to it directly.
- **Bad Weather** result chains to a sub-table that requires input (climate/season) and uses an odd/even die mechanic. Model this as a table with `requiresInput` and results for odd/even (range [1,1] and [2,2] over a d2).

### `src/data/creatures.json`

Populate with all statblocks from the playtest PDF. This includes:

**Animals** (33 entries): Ape, Bear, Bear (Cave), Camel, Cat, Cat (Big), Wildcat, Chicken, Crocodile, Crow, Crow (Giant), Deer, Dog, Donkey, Elephant, Goat, Hawk, Horse (Draft), Horse (Riding), Horse (War), Monitor Lizard, Mule, Ox, Rat, Scorpion (Giant), Snake (Constrictor), Snake (Venomous), Snake (Venomous Giant), Spider, Spider (Giant), Wolf, Wolf (Dire)

**Humans** (22 entries): Alchemist, Archer ×3 (Power 4/7/10), Blacksmith, Commoner, Conjurer, Cultist, Elementalist, Enchanter, Guide, Illusionist, Priest, Sage ×2 (Power 3/6), Thief ×3 (Power 3/6/9), Torchbearer, Transmuter, Trapper, Warrior Pike ×3 (Power 4/7/10), Warrior Sword ×3 (Power 4/7/10)

**Monsters** (11 entries): Blood Creature A/B/C, Ring Collector, Undead A/B/C/D/E/F/G/H

### `src/data/items.json`

Populate with all items from the inventory cards PDF. Organised by category:

**Weapons — one-handed** (8 entries): Hammer, Mace, Knife, Sword, Handaxe, Axe, Stiletto, Spear

**Weapons — two-handed** (8 entries, 2 slots each): Flail, Maul, Glaive, Greatsword, Halberd, Greataxe, Pike, Warpick

**Ranged weapons** (3 entries): Shortbow (1 slot), Longbow (2 slots), Crossbow (2 slots)

**Ammo** (2 entries): Quiver of Arrows, Case of Crossbow Bolts

**Armor** (4 entries): Shield (AD 5), Light Armor (2 slots, AD 5), Medium Armor (3 slots, AD 10), Heavy Armor (4 slots, AD 15)

**Consumables** (13 entries): Healing Potion, Rage Potion, Speed Potion, Blood Concoction, Acid Vial, Strong Acid Vial, Poison Vial, Strong Poison, Fire Bomb, Smoke Bomb, Glue Pot, Oil Flask, Soothing Candy

**Magic items** (9 entries): Life Ring, Death's Ring, Minor Telekinesis Ring, Necklace of Teeth, Boom Wand, Hurling Wand, Alteration Stone, Plague Mask, Whistle of Dog Summoning

**Spell books — R0** (22 entries): Animal Form, Repair, Take Shape (Alteration); Minor Blessing, Minor Healing, Minor Ward, Wound Closure (Benefaction); Jaunt, Teleport Object, Summon Object (Conjuration); Create Water, Fire Hands, Fire Lance, Spark, Stream, Thunder (Elemental); Cacophony, Light, Minor Phantasm (Illusion); Bone Capture, Minor Curse, Monster Sense (Necromancy)

**Spell books — R1** (5 entries): Shrink, Stubborn Object (Alteration); Group Healing (Benefaction); Corrupt, Deadspeech (Necromancy)

**Tools** (7 entries): Alchemist's Tools, Blacksmith's Tools, Enchanter's Tools, Cook's Utensils, Lockpick Set, Surgical Kit, Lore Book

**Gear** (36 entries): Rope, Torch, Candle, Lantern, Bucket, Shovel, Crowbar, Grappling Hook, Pitons, Chalk, Soap, Bear Trap, Ball Bearings, Caltrops, Net, Padlock, Chain, Block & Tackle, Compass, Cold Weather Gear, Coin Purse, Mirror, Spyglass, Musical Instrument, Magnifying Glass, Merchant's Scales, Miner's Pick, Journal, Card Deck, Quill & Inkpot, String, Whistle, Pot, 11-Foot Pole, Ladder, Tent

**Treasure** (7 entries): Art Object (Tiny), Art Object (Small), Art Object (Medium), Gem, Monster Part, Crafting Material (Bar), Crafting Material (Log)

**Mystery** (3 entries, generic — ref determines details): Magic Ring, Magic Wand, Potion

---

## Data Loader (`src/data/loader.ts`)

```ts
import tablesData from './tables.json'
import creaturesData from './creatures.json'
import itemsData from './items.json'
import type { RolledTable, Creature, Item } from '../types'

export function getTables(): RolledTable[]
export function getTableById(id: string): RolledTable | undefined
export function getCreatures(): Creature[]
export function getCreatureById(id: string): Creature | undefined
export function getItems(): Item[]
```

Enable JSON imports in `tsconfig.json` with `"resolveJsonModule": true`.

---

## Verify

- `npm run build` passes without type errors
- All creatures from the PDF are present and typed correctly
- All items from the inventory cards PDF are present and typed correctly
- At least one multi-level chain (Travel Encounters → Any Monster → Blood Dungeon) resolves correctly when traced through the data
- `getTableById` resolves every `chain` and `chains` reference to a real table entry

## References

- Design doc: Configuration section and Rolled Table Schema
- Design doc: Statblock Lookup (Creatures and Items)
- Source: Crows Ref Book Playtest 2 PDF (creatures pp. 16–38, tables pp. 1–14)
- Source: Crows Inventory Cards for Public Playtest 2 PDF (all pages)
- Spec 01 must be complete before this spec runs (can run in parallel with Specs 02 and 03)
