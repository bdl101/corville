import type { RollEntry } from '../logic/roller'
import { RollResult } from './RollResult'

interface SessionLogOptions {
  entries: RollEntry[]
  collapsed: boolean
  onToggle: () => void
  onEntityClick?: (id: string) => void
}

export function SessionLog({ entries, collapsed, onToggle, onEntityClick }: SessionLogOptions): HTMLElement {
  const el = document.createElement('div')
  el.className = 'session-log'

  const count = entries.length
  const countLabel = count === 1 ? '1 roll' : `${count} rolls`

  const header = document.createElement('button')
  header.className = 'session-log__header'
  header.textContent = count === 0 ? 'Session Log (no rolls yet)' : `Session Log (${countLabel})`
  header.addEventListener('click', onToggle)

  const content = document.createElement('div')
  content.className = 'session-log__content'
  content.hidden = collapsed

  if (!collapsed && entries.length > 0) {
    for (const entry of [...entries].reverse()) {
      const entryEl = document.createElement('div')
      entryEl.className = 'session-log__entry'
      entryEl.appendChild(RollResult(entry, 0, { onEntityClick }))
      content.appendChild(entryEl)
    }
  }

  el.appendChild(header)
  el.appendChild(content)
  return el
}
