import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/layout.css'

import { TabBar } from './components/TabBar'
import { TablesView } from './views/TablesView'
import { LookupView } from './views/LookupView'
import { EncounterView } from './views/EncounterView'

type Tab = 'tables' | 'lookup' | 'encounter'

let currentTab: Tab = 'tables'

const viewContainer = document.getElementById('view-container')!
const tabBarContainer = document.getElementById('tab-bar-container')!

function getView(tab: Tab): HTMLElement {
  if (tab === 'tables') return TablesView()
  if (tab === 'lookup') return LookupView()
  return EncounterView()
}

function renderTabBar() {
  tabBarContainer.innerHTML = ''
  tabBarContainer.appendChild(
    TabBar({ activeTab: currentTab, onNavigate: navigate })
  )
}

function navigate(tab: Tab) {
  currentTab = tab
  viewContainer.innerHTML = ''
  viewContainer.appendChild(getView(tab))
  renderTabBar()
}

window.addEventListener('corville:navigate', (e) => {
  navigate((e as CustomEvent<{ tab: Tab }>).detail.tab)
})

navigate(currentTab)
