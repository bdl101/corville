import tablesData from './tables.json'
import creaturesData from './creatures.json'
import itemsData from './items.json'
import type { RolledTable, Creature, Item } from '../types'

export function getTables(): RolledTable[] {
  return tablesData as RolledTable[]
}

export function getTableById(id: string): RolledTable | undefined {
  return getTables().find(t => t.id === id)
}

export function getCreatures(): Creature[] {
  return creaturesData as Creature[]
}

export function getCreatureById(id: string): Creature | undefined {
  return getCreatures().find(c => c.id === id)
}

export function getItems(): Item[] {
  return itemsData as Item[]
}
