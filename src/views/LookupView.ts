import { getCreatures, getItems } from '../data/loader'
import { EntityList } from '../components/EntityList'
import { EntityDetail } from '../components/EntityDetail'
import type { Creature, Item } from '../types'


type SubTab = 'creatures' | 'items'

export function LookupView(): HTMLElement {
  const creatures = getCreatures()
  const items = getItems()

  let activeTab: SubTab = 'creatures'
  let selectedEntity: Creature | Item | null = null
  let filterState: Record<SubTab, string> = { creatures: '', items: '' }

  const view = document.createElement('div')
  view.className = 'view lookup-view'

  const subTabBar = document.createElement('div')
  subTabBar.className = 'lookup-view__sub-tabs'

  const contentArea = document.createElement('div')

  function renderSubTabs() {
    subTabBar.innerHTML = ''
    for (const tab of ['creatures', 'items'] as SubTab[]) {
      const btn = document.createElement('button')
      btn.className = 'lookup-view__sub-tab'
      if (tab === activeTab) btn.classList.add('lookup-view__sub-tab--active')
      btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1)
      btn.addEventListener('click', () => {
        if (tab !== activeTab) {
          activeTab = tab
          filterState[tab] = ''
          selectedEntity = null
          render()
        }
      })
      subTabBar.appendChild(btn)
    }
  }

  function showList() {
    contentArea.innerHTML = ''
    const entities: (Creature | Item)[] = activeTab === 'creatures' ? creatures : items
    const list = EntityList({
      entities,
      onSelect: (entity) => {
        selectedEntity = entity
        render()
      },
      initialFilter: filterState[activeTab],
      onFilterChange: (f) => { filterState[activeTab] = f },
      getMeta: activeTab === 'creatures'
        ? (e) => (e as Creature).type
        : (e) => (e as Item).category,
    })
    contentArea.appendChild(list)
  }

  function showDetail() {
    contentArea.innerHTML = ''
    contentArea.appendChild(
      EntityDetail({
        entity: selectedEntity!,
        onBack: () => {
          selectedEntity = null
          render()
        },
      })
    )
  }

  function render() {
    renderSubTabs()
    if (selectedEntity) {
      showDetail()
    } else {
      showList()
    }
  }

  view.appendChild(subTabBar)
  view.appendChild(contentArea)

  render()

  return view
}
