import type { Creature } from '../types'
import type { EncounterState } from '../types/encounter'

let state: EncounterState = { creatures: [], round: 1 }
const listeners = new Set<() => void>()

function notify(): void {
  for (const l of listeners) l()
}

export function getState(): EncounterState {
  return state
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function addCreature(creature: Creature): void {
  const sameType = state.creatures.filter(c => c.creatureId === creature.id)
  const count = sameType.length

  let updatedCreatures = [...state.creatures]

  if (count === 1) {
    updatedCreatures = updatedCreatures.map(c =>
      c.creatureId === creature.id
        ? { ...c, displayName: `${creature.name} 1` }
        : c
    )
  }

  const displayName = count === 0 ? creature.name : `${creature.name} ${count + 1}`
  const uid = crypto.randomUUID()

  updatedCreatures.push({
    uid,
    creatureId: creature.id,
    displayName,
    maxStamina: creature.stamina,
    currentStamina: creature.stamina,
    hasTakenTurn: false,
    hasUsedReaction: false,
  })

  state = { ...state, creatures: updatedCreatures }
  notify()
}

export function removeCreature(uid: string): void {
  state = { ...state, creatures: state.creatures.filter(c => c.uid !== uid) }
  notify()
}

export function adjustStamina(uid: string, delta: number): void {
  state = {
    ...state,
    creatures: state.creatures.map(c => {
      if (c.uid !== uid) return c
      const next = Math.min(c.maxStamina, Math.max(0, c.currentStamina + delta))
      return { ...c, currentStamina: next }
    }),
  }
  notify()
}

export function setTurn(uid: string, taken: boolean): void {
  state = {
    ...state,
    creatures: state.creatures.map(c =>
      c.uid === uid ? { ...c, hasTakenTurn: taken } : c
    ),
  }
  notify()
}

export function setReaction(uid: string, used: boolean): void {
  state = {
    ...state,
    creatures: state.creatures.map(c =>
      c.uid === uid ? { ...c, hasUsedReaction: used } : c
    ),
  }
  notify()
}

export function newRound(): void {
  state = {
    ...state,
    round: state.round + 1,
    creatures: state.creatures.map(c => ({
      ...c,
      hasTakenTurn: false,
      hasUsedReaction: false,
    })),
  }
  notify()
}

export function clearEncounter(): void {
  state = { creatures: [], round: 1 }
  notify()
}
