# Spec 03 — Navigation

## Goal

Implement the persistent tab bar and the view-switching mechanism that drives the single-page app.

## Deliverables

- `src/components/TabBar.ts` — tab bar component
- `src/views/TablesView.ts` — placeholder Tables view
- `src/views/LookupView.ts` — placeholder Lookup view
- `src/views/EncounterView.ts` — placeholder Encounter view (disabled state)
- View router wired into `main.ts`

## Behaviour

- Three tabs: **Tables**, **Lookup**, **Encounter**
- Tab bar is always visible at the bottom of the screen
- Clicking a tab swaps the active view in the content area
- Active tab has a visual indicator (accent colour underline or highlight)
- **Encounter tab is non-functional**: it should appear in the tab bar but clicking it does nothing. It should have a visually muted/disabled appearance (e.g. lower opacity, no hover effect)

## Tasks

### 1. View scaffolds

Create minimal placeholder views. Each is a function that returns an `HTMLElement`:

```ts
// src/views/TablesView.ts
export function TablesView(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'view'
  el.textContent = 'Tables'
  return el
}
```

Repeat for `LookupView` and `EncounterView`.

### 2. Tab bar component (`src/components/TabBar.ts`)

The tab bar renders three tab buttons and calls an `onNavigate` callback when a functional tab is clicked.

```ts
type Tab = 'tables' | 'lookup' | 'encounter'

interface TabBarOptions {
  activeTab: Tab
  onNavigate: (tab: Tab) => void
}

export function TabBar(options: TabBarOptions): HTMLElement
```

Tab bar markup structure:

```html
<nav class="tab-bar">
  <button class="tab-bar__tab tab-bar__tab--active" data-tab="tables">Tables</button>
  <button class="tab-bar__tab" data-tab="lookup">Lookup</button>
  <button class="tab-bar__tab tab-bar__tab--disabled" data-tab="encounter" disabled>Encounter</button>
</nav>
```

CSS for tab bar items (add to `src/styles/layout.css` or a dedicated component CSS file):

```
.tab-bar__tab
  flex: 1
  padding: var(--space-3)
  background: none
  border: none
  color: var(--color-text-secondary)
  font-size: var(--font-size-sm)
  cursor: pointer
  text-transform: uppercase
  letter-spacing: 0.05em

.tab-bar__tab--active
  color: var(--color-text-primary)
  border-top: 2px solid var(--color-accent)

.tab-bar__tab--disabled
  opacity: 0.35
  cursor: not-allowed
```

### 3. Router / view mounting (`main.ts`)

- Maintain a `currentTab` variable (default: `'tables'`)
- On tab change, unmount the current view element and mount the new one in the `.view` container
- Re-render the `TabBar` with the updated `activeTab` on each navigation

Simple implementation (no library needed):

```ts
let currentTab: Tab = 'tables'
const viewContainer = document.getElementById('view-container')!

function navigate(tab: Tab) {
  currentTab = tab
  viewContainer.innerHTML = ''
  viewContainer.appendChild(getView(tab))
  renderTabBar()
}

function getView(tab: Tab): HTMLElement {
  if (tab === 'tables') return TablesView()
  if (tab === 'lookup') return LookupView()
  return EncounterView()
}
```

### 4. HTML shell (`index.html`)

```html
<div id="app">
  <main id="view-container" class="view"></main>
  <div id="tab-bar-container"></div>
</div>
```

### 5. Verify

- Clicking Tables and Lookup tabs swaps the view content
- Active tab is visually distinct
- Encounter tab is visible but clicking it does nothing and it appears muted
- Tab bar stays fixed at the bottom on both mobile (375px) and desktop (1280px) viewports

## References

- Design doc: Navigation section
- Design doc: MVP Scope (Encounter tab non-functional)
- Spec 02 must be complete before this spec runs
