// Rolled Tables

export interface TableInput {
  prompt: string
  options: string[]
}

export interface TableResult {
  range: [number, number]
  text: string
  description?: string
  chain?: string
  chains?: string[]
  entityRef?: string
  entityRefs?: Array<{ id: string; count: number | string }>
}

export interface RolledTable {
  id: string
  name: string
  die: number
  requiresInput?: TableInput
  inputChains?: Record<string, string[]>
  repeatDie?: number
  results: TableResult[]
  notes?: string
}

// Creatures

export type CreatureSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge'
export type CreatureType = 'Animal' | 'Human' | 'Blood' | 'Undead' | 'Angel' | 'Demon' | 'Plant' | 'Unique'

export interface Attack {
  name: string
  bonus: number
  range: string
  tier2: string
  tier3: string
  note?: string
}

export interface Feature {
  name: string
  description: string
  uses?: string
}

interface BaseCreature {
  id: string
  name: string
  size: CreatureSize
  power: number
  type: CreatureType
  stamina: number
  speed: string
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
  ad?: string
  expertises: string[]
  equipment: string[]
}

export interface MonsterCreature extends BaseCreature {
  type: 'Blood' | 'Undead' | 'Angel' | 'Demon' | 'Plant' | 'Unique'
  reactions?: number
  colloquialNames?: string[]
  description?: string
}

export type Creature = AnimalCreature | HumanCreature | MonsterCreature

// Items

export type ItemCategory =
  | 'weapon' | 'armor' | 'ammo'
  | 'consumable' | 'magic' | 'book'
  | 'tool' | 'gear' | 'treasure'

export interface RRTable {
  tier1?: string
  tier2: string
  tier3: string
}

export interface CraftingRecipe {
  skill: string
  materials: string
  time: number
}

interface BaseItem {
  id: string
  name: string
  stack: number
  slots: number
  category: ItemCategory
  cost?: number
  description?: string
  crafting?: CraftingRecipe
}

export interface WeaponItem extends BaseItem {
  category: 'weapon'
  attackStat: 'A' | 'S' | 'A or S'
  range: string
  tier2: string
  tier3: string
  keywords: string[]
}

export interface ArmorItem extends BaseItem {
  category: 'armor'
  ad: number
}

export interface AmmoItem extends BaseItem {
  category: 'ammo'
  ud?: string
  ammoFor: string
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
  slot?: string
  ud?: string
  maneuver?: string
  action?: string
  rrTable?: RRTable
}

export interface BookItem extends BaseItem {
  category: 'book'
  rank: number
  school: string
  actionType: string
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
