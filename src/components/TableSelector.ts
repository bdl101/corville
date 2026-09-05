import type { RolledTable } from '../types'

interface TableSelectorOptions {
  tables: RolledTable[]
  onSelect: (table: RolledTable) => void
}

const GROUPS: { label: string; ids: string[] }[] = [
  {
    label: 'Travel',
    ids: ['travel-encounters'],
  },
  {
    label: 'Weather',
    ids: [
      'bad-weather',
      'bad-weather-cold-winter',
      'bad-weather-desert',
      'bad-weather-fall',
      'bad-weather-spring',
      'bad-weather-tropical-summer',
    ],
  },
  {
    label: 'Animals',
    ids: [
      'wild-animal-dispatch',
      'wild-animal-reaction',
      'coastal-animal-encounters',
      'cold-climate-animal-encounters',
      'desert-animal-encounters',
      'forest-animal-encounters',
      'grassland-animal-encounters',
      'hill-mountain-animal-encounters',
      'marsh-swamp-animal-encounters',
    ],
  },
  {
    label: 'Dungeons',
    ids: ['any-monster-encounter', 'blood-dungeon-encounters', 'undead-dungeon-encounters'],
  },
  {
    label: 'Travelers',
    ids: ['travelers', 'traveler-encounters', 'traveler-rewards'],
  },
  {
    label: 'Merchants',
    ids: ['merchant-sales', 'merchant-guards', 'merchant-buy-offer'],
  },
  {
    label: 'Humans',
    ids: ['miasma-touched-humans', 'miasma-touched-encounters'],
  },
  {
    label: 'Interesting Things',
    ids: ['minor-interesting-things', 'major-interesting-things'],
  },
]

export function TableSelector({ tables, onSelect }: TableSelectorOptions): HTMLElement {
  const el = document.createElement('div')
  el.className = 'table-selector'

  const tableMap = new Map(tables.map(t => [t.id, t]))
  const assignedIds = new Set<string>()

  const select = document.createElement('select')
  select.className = 'input table-selector__select'

  for (const group of GROUPS) {
    const groupTables = group.ids.map(id => tableMap.get(id)).filter((t): t is RolledTable => !!t)
    if (groupTables.length === 0) continue

    const optgroup = document.createElement('optgroup')
    optgroup.label = group.label

    for (const table of groupTables) {
      const option = document.createElement('option')
      option.value = table.id
      option.textContent = table.name
      optgroup.appendChild(option)
      assignedIds.add(table.id)
    }

    select.appendChild(optgroup)
  }

  // Any tables not covered by GROUPS go into a fallback group
  const ungrouped = tables.filter(t => !assignedIds.has(t.id))
  if (ungrouped.length > 0) {
    const optgroup = document.createElement('optgroup')
    optgroup.label = 'Other'
    for (const table of ungrouped) {
      const option = document.createElement('option')
      option.value = table.id
      option.textContent = table.name
      optgroup.appendChild(option)
    }
    select.appendChild(optgroup)
  }

  const rollBtn = document.createElement('button')
  rollBtn.className = 'btn btn--primary table-selector__roll'
  rollBtn.textContent = 'Roll'

  rollBtn.addEventListener('click', () => {
    const table = tableMap.get(select.value)
    if (table) onSelect(table)
  })

  el.appendChild(select)
  el.appendChild(rollBtn)

  return el
}
