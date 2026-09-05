import { EntityCard } from './EntityCard'

interface EntityListProps<T extends { id: string; name: string }> {
  entities: T[]
  onSelect: (entity: T) => void
  initialFilter?: string
  onFilterChange?: (filter: string) => void
}

export function EntityList<T extends { id: string; name: string }>({
  entities,
  onSelect,
  initialFilter = '',
  onFilterChange,
}: EntityListProps<T>): HTMLElement {
  const el = document.createElement('div')
  el.className = 'entity-list'

  const input = document.createElement('input')
  input.type = 'text'
  input.className = 'input entity-list__search'
  input.placeholder = 'Filter…'
  input.value = initialFilter
  el.appendChild(input)

  const listEl = document.createElement('div')
  listEl.className = 'entity-list__items'
  el.appendChild(listEl)

  function render(filter: string) {
    listEl.innerHTML = ''
    const lower = filter.toLowerCase()
    const filtered = lower ? entities.filter(e => e.name.toLowerCase().includes(lower)) : entities

    if (filtered.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'entity-list__empty'
      empty.textContent = 'No results'
      listEl.appendChild(empty)
      return
    }

    for (const entity of filtered) {
      listEl.appendChild(EntityCard({ name: entity.name, onClick: () => onSelect(entity) }))
    }
  }

  input.addEventListener('input', () => {
    render(input.value)
    onFilterChange?.(input.value)
  })

  render(initialFilter)

  return el
}
