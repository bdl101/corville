type Tab = 'tables' | 'lookup' | 'encounter'

interface TabBarOptions {
  activeTab: Tab
  onNavigate: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; disabled?: boolean }[] = [
  { id: 'tables', label: 'Tables' },
  { id: 'lookup', label: 'Lookup' },
  { id: 'encounter', label: 'Encounter' },
]

export function TabBar({ activeTab, onNavigate }: TabBarOptions): HTMLElement {
  const nav = document.createElement('nav')
  nav.className = 'tab-bar'

  for (const tab of TABS) {
    const btn = document.createElement('button')
    btn.className = 'tab-bar__tab'
    btn.dataset.tab = tab.id
    btn.textContent = tab.label

    if (tab.disabled) {
      btn.classList.add('tab-bar__tab--disabled')
      btn.disabled = true
    } else if (tab.id === activeTab) {
      btn.classList.add('tab-bar__tab--active')
    } else {
      btn.addEventListener('click', () => onNavigate(tab.id))
    }

    nav.appendChild(btn)
  }

  return nav
}
