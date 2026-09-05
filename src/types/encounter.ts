export interface EncounterCreature {
  uid: string
  creatureId: string
  displayName: string
  maxStamina: number
  currentStamina: number
  hasTakenTurn: boolean
  hasUsedReaction: boolean
}

export interface EncounterState {
  creatures: EncounterCreature[]
  round: number
}
