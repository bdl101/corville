import type { EncounterCreature } from '../types/encounter'
import {
  removeCreature,
  adjustStamina,
  setTurn,
  setReaction,
} from '../state/encounter'

interface EncounterCreatureCardProps {
  creature: EncounterCreature
  onRequestDetail: (creatureId: string) => void
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  if (className) e.className = className
  if (text !== undefined) e.textContent = text
  return e
}

export function EncounterCreatureCard({ creature, onRequestDetail }: EncounterCreatureCardProps): HTMLElement {
  const { uid, displayName, currentStamina, maxStamina, hasTakenTurn, hasUsedReaction, creatureId } = creature

  const isDead = currentStamina === 0
  const card = el('div', 'encounter-creature-card' + (isDead ? ' disabled' : hasTakenTurn ? ' turn-taken' : ''))

  // Row 1: [×] [name] [Turn] [Reaction]
  const row1 = el('div', 'encounter-creature-card__row')

  const removeBtn = el('button', 'btn btn--ghost encounter-creature-card__remove', '×')
  removeBtn.setAttribute('aria-label', `Remove ${displayName}`)
  removeBtn.addEventListener('click', () => removeCreature(uid))

  const nameBtn = el('button', 'encounter-creature-card__name', displayName)
  nameBtn.addEventListener('click', () => onRequestDetail(creatureId))

  const turnBtn = el('button', 'encounter-toggle' + (hasTakenTurn ? ' encounter-toggle--active' : ''), 'Turn')
  turnBtn.setAttribute('aria-pressed', String(hasTakenTurn))
  turnBtn.addEventListener('click', () => setTurn(uid, !hasTakenTurn))

  const reactionBtn = el('button', 'encounter-toggle' + (hasUsedReaction ? ' encounter-toggle--active' : ''), 'Reaction')
  reactionBtn.setAttribute('aria-pressed', String(hasUsedReaction))
  reactionBtn.addEventListener('click', () => setReaction(uid, !hasUsedReaction))

  row1.appendChild(removeBtn)
  row1.appendChild(nameBtn)
  row1.appendChild(turnBtn)
  row1.appendChild(reactionBtn)

  // Row 2: [spacer] [Stamina: X / Y] [−] [+]
  const row2 = el('div', 'encounter-creature-card__row')

  const spacer = el('div', 'encounter-creature-card__row-spacer')

  const staminaText = el('span', 'encounter-creature-card__stamina', `Stamina: ${currentStamina} / ${maxStamina}`)

  const controls = el('div', 'encounter-stamina-controls')

  const minusBtn = el('button', 'btn encounter-stamina-btn', '−')
  minusBtn.disabled = currentStamina === 0
  minusBtn.setAttribute('aria-label', 'Decrease stamina')
  minusBtn.addEventListener('click', () => adjustStamina(uid, -1))

  const plusBtn = el('button', 'btn encounter-stamina-btn', '+')
  plusBtn.disabled = currentStamina === maxStamina
  plusBtn.setAttribute('aria-label', 'Increase stamina')
  plusBtn.addEventListener('click', () => adjustStamina(uid, 1))

  controls.appendChild(minusBtn)
  controls.appendChild(plusBtn)

  row2.appendChild(spacer)
  row2.appendChild(staminaText)
  row2.appendChild(controls)

  card.appendChild(row1)
  card.appendChild(row2)

  return card
}
