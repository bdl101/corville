import type { RolledTable } from '../types'

interface TableSelectorOptions {
  tables: RolledTable[]
  onSelect: (table: RolledTable) => void
}

export function TableSelector({ tables, onSelect }: TableSelectorOptions): HTMLElement {
  const el = document.createElement('div')
  el.className = 'table-selector'

  for (const table of tables) {
    const card = document.createElement('button')
    card.className = 'card table-selector__card'
    card.textContent = table.name
    card.addEventListener('click', () => onSelect(table))
    el.appendChild(card)
  }

  return el
}
