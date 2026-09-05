import type { RolledTable } from '../types'

interface TableSelectorOptions {
  tables: RolledTable[]
  onSelect: (table: RolledTable) => void
}

export function TableSelector({ tables, onSelect }: TableSelectorOptions): HTMLElement {
  const el = document.createElement('div')
  el.className = 'table-selector'

  const select = document.createElement('select')
  select.className = 'input table-selector__select'

  for (const table of tables) {
    const option = document.createElement('option')
    option.value = table.id
    option.textContent = table.name
    select.appendChild(option)
  }

  const rollBtn = document.createElement('button')
  rollBtn.className = 'btn btn--primary table-selector__roll'
  rollBtn.textContent = 'Roll'

  rollBtn.addEventListener('click', () => {
    const table = tables.find(t => t.id === select.value)
    if (table) onSelect(table)
  })

  el.appendChild(select)
  el.appendChild(rollBtn)

  return el
}
