import type { Creature } from '../types'
import { addCreature } from '../state/encounter'

interface AddCreaturePanelProps {
  allCreatures: Creature[]
  onClose: () => void
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

export function AddCreaturePanel({ allCreatures, onClose }: AddCreaturePanelProps): HTMLElement {
  const overlay = el('div', 'add-creature-panel')

  const dialog = el('div', 'add-creature-panel__dialog')
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-label', 'Add Creature')

  // Header
  const header = el('div', 'add-creature-panel__header')
  header.appendChild(el('span', 'add-creature-panel__title', 'Add Creature'))
  const closeBtn = el('button', 'btn btn--ghost popup__close', '×')
  closeBtn.setAttribute('aria-label', 'Close')
  closeBtn.addEventListener('click', () => { overlay.remove(); onClose() })
  header.appendChild(closeBtn)
  dialog.appendChild(header)

  // Search input
  const searchWrapper = el('div', 'add-creature-panel__search')
  const searchInput = el('input', 'input')
  searchInput.type = 'text'
  searchInput.placeholder = 'Filter creatures…'
  searchWrapper.appendChild(searchInput)
  dialog.appendChild(searchWrapper)

  // List
  const listEl = el('div', 'add-creature-panel__list')
  dialog.appendChild(listEl)

  function renderList(filter: string) {
    listEl.innerHTML = ''
    const query = filter.toLowerCase()
    const matches = allCreatures.filter(c => c.name.toLowerCase().includes(query))

    if (matches.length === 0) {
      listEl.appendChild(el('p', 'add-creature-panel__empty', 'No creatures found.'))
      return
    }

    for (const creature of matches) {
      const row = el('button', 'add-creature-panel__row')

      const nameSpan = el('span', 'add-creature-panel__row-name', creature.name)
      const metaSpan = el('span', 'add-creature-panel__row-meta', `${creature.type} — ${creature.stamina} HP`)

      row.appendChild(nameSpan)
      row.appendChild(metaSpan)
      row.addEventListener('click', () => {
        addCreature(creature)
        overlay.remove()
        onClose()
      })
      listEl.appendChild(row)
    }
  }

  searchInput.addEventListener('input', () => renderList(searchInput.value))
  renderList('')

  overlay.appendChild(dialog)

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) { overlay.remove(); onClose() }
  })

  return overlay
}
