import { getState, subscribe, newRound, clearEncounter } from '../state/encounter'
import { getCreatures, getCreatureById } from '../data/loader'
import { EncounterCreatureCard } from '../components/EncounterCreatureCard'
import { AddCreaturePanel } from '../components/AddCreaturePanel'
import { EntityDetail } from '../components/EntityDetail'
import { showEntityPopup } from '../utils/popup'

// Track the active subscription so navigating away and back doesn't leak listeners
let prevUnsubscribe: (() => void) | null = null

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

export function EncounterView(): HTMLElement {
  if (prevUnsubscribe) {
    prevUnsubscribe()
    prevUnsubscribe = null
  }

  const allCreatures = getCreatures()

  const view = el('div', 'view encounter-view')

  const header = el('div', 'encounter-view__header')
  const body = el('div', 'encounter-view__body')

  view.appendChild(header)
  view.appendChild(body)

  function showCreatureDetail(creatureId: string): void {
    const creature = getCreatureById(creatureId)
    if (!creature) return
    const detail = EntityDetail({
      entity: creature,
      onBack: () => document.querySelector('.popup-overlay')?.remove(),
    })
    showEntityPopup(detail, () => {})
  }

  function openAddPanel(): void {
    const panel = AddCreaturePanel({ allCreatures, onClose: () => {} })
    document.body.appendChild(panel)
    const input = panel.querySelector('input')
    input?.focus()
  }

  function renderHeader(): void {
    const state = getState()
    header.textContent = ''

    const roundLabel = el('span', 'encounter-view__round', `Round ${state.round}`)

    const actions = el('div', 'encounter-view__actions')

    const newRoundBtn = el('button', 'btn', 'New Round')
    newRoundBtn.addEventListener('click', () => newRound())

    const clearBtn = el('button', 'btn btn--ghost', 'Clear')
    clearBtn.addEventListener('click', () => {
      if (window.confirm('Clear the encounter? This cannot be undone.')) clearEncounter()
    })

    actions.appendChild(newRoundBtn)
    actions.appendChild(clearBtn)

    header.appendChild(roundLabel)
    header.appendChild(actions)
  }

  function renderBody(): void {
    const state = getState()
    body.textContent = ''

    if (state.creatures.length === 0) {
      const emptyState = el('div', 'encounter-empty')
      emptyState.appendChild(el('p', undefined, 'No creatures in this encounter.'))
      const addBtn = el('button', 'btn btn--primary', 'Add Creature')
      addBtn.addEventListener('click', openAddPanel)
      emptyState.appendChild(addBtn)
      body.appendChild(emptyState)
    } else {
      const list = el('div', 'encounter-creature-list')
      for (const creature of state.creatures) {
        list.appendChild(EncounterCreatureCard({ creature, onRequestDetail: showCreatureDetail }))
      }
      body.appendChild(list)

      const addBtn = el('button', 'btn encounter-view__add-btn', 'Add Creature')
      addBtn.addEventListener('click', openAddPanel)
      body.appendChild(addBtn)
    }
  }

  function render(): void {
    renderHeader()
    renderBody()
  }

  prevUnsubscribe = subscribe(render)
  render()

  return view
}
