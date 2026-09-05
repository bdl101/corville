import type { RollEntry, ResolvedEntityRef } from '../logic/roller'
import { getCreatureById, getItemById } from '../data/loader'
import { addCreature } from '../state/encounter'
import type { Creature } from '../types'

interface RollResultOptions {
  onEntityClick?: (id: string) => void
}

function collectResolvedRefs(entry: RollEntry): ResolvedEntityRef[] {
  const refs: ResolvedEntityRef[] = []
  if (entry.result.entityRef) refs.push({ id: entry.result.entityRef, count: 1 })
  for (const ref of entry.resolvedEntityRefs ?? []) refs.push(ref)
  for (const chain of entry.chains ?? []) refs.push(...collectResolvedRefs(chain))
  return refs
}

function switchToEncounter(): void {
  window.dispatchEvent(new CustomEvent('corville:navigate', { detail: { tab: 'encounter' } }))
}

export function RollResult(entry: RollEntry, depth = 0, options: RollResultOptions = {}): HTMLElement {
  const el = document.createElement('div')
  el.className = depth === 0 ? 'roll-result' : 'roll-result roll-result--chained'

  const header = document.createElement('div')
  header.className = 'roll-result__header'

  const tableName = document.createElement('span')
  tableName.className = 'roll-result__table-name'
  tableName.textContent = entry.table.name

  const rolled = document.createElement('span')
  rolled.className = 'roll-result__rolled'
  rolled.textContent = `Rolled ${entry.rolledValue} on d${entry.table.die}`

  header.appendChild(tableName)
  header.appendChild(rolled)
  el.appendChild(header)

  if (entry.input) {
    const inputEl = document.createElement('div')
    inputEl.className = 'roll-result__input'
    inputEl.textContent = entry.input
    el.appendChild(inputEl)
  }

  const text = document.createElement('div')
  text.className = 'roll-result__text'
  text.textContent = entry.resolvedText
  el.appendChild(text)

  if (entry.result.description) {
    const desc = document.createElement('div')
    desc.className = 'roll-result__description'
    desc.textContent = entry.result.description
    el.appendChild(desc)
  }

  if (entry.result.entityRef && options.onEntityClick) {
    const ref = entry.result.entityRef
    const entity = getCreatureById(ref) ?? getItemById(ref)
    if (entity) {
      const link = document.createElement('button')
      link.className = 'btn btn--ghost roll-result__entity-link'
      link.textContent = `${entity.name} →`
      link.addEventListener('click', () => options.onEntityClick!(ref))
      el.appendChild(link)
    }
  }

  if (entry.result.entityRef) {
    const creature = getCreatureById(entry.result.entityRef)
    if (creature) {
      const btn = document.createElement('button')
      btn.className = 'btn btn--sm roll-result__add-creature'
      btn.textContent = `+ Add ${creature.name} to Encounter`
      btn.addEventListener('click', () => {
        addCreature(creature)
        switchToEncounter()
      })
      el.appendChild(btn)
    }
  }

  for (const ref of entry.resolvedEntityRefs ?? []) {
    const creature = getCreatureById(ref.id)
    if (creature) {
      const btn = document.createElement('button')
      btn.className = 'btn btn--sm roll-result__add-creature'
      btn.textContent = `+ Add ${ref.count} ${creature.name} to Encounter`
      btn.addEventListener('click', () => {
        for (let i = 0; i < ref.count; i++) addCreature(creature)
        switchToEncounter()
      })
      el.appendChild(btn)
    }
  }

  if (entry.chains?.length) {
    const chainsEl = document.createElement('div')
    chainsEl.className = 'roll-result__chains'
    for (const chain of entry.chains) {
      chainsEl.appendChild(RollResult(chain, depth + 1, options))
    }
    el.appendChild(chainsEl)
  }

  if (depth === 0) {
    const allRefs = collectResolvedRefs(entry)
    const resolvable = allRefs
      .map(ref => ({ creature: getCreatureById(ref.id), count: ref.count }))
      .filter((r): r is { creature: Creature; count: number } => r.creature !== undefined)

    if (resolvable.length >= 2) {
      const addAllBtn = document.createElement('button')
      addAllBtn.className = 'btn roll-result__add-all'
      addAllBtn.textContent = 'Add all to Encounter'
      addAllBtn.addEventListener('click', () => {
        for (const { creature, count } of resolvable) {
          for (let i = 0; i < count; i++) addCreature(creature)
        }
        switchToEncounter()
      })
      el.appendChild(addAllBtn)
    }
  }

  return el
}
