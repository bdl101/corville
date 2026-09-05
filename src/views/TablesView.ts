import { getTables, getCreatureById, getItemById } from '../data/loader'
import { rollTable } from '../logic/roller'
import type { RollEntry } from '../logic/roller'
import type { RolledTable } from '../types'
import { TableSelector } from '../components/TableSelector'
import { InputPrompt } from '../components/InputPrompt'
import { RollResult } from '../components/RollResult'
import { SessionLog } from '../components/SessionLog'
import { EntityDetail } from '../components/EntityDetail'

function openEntityDetail(id: string): void {
  const entity = getCreatureById(id) ?? getItemById(id)
  if (!entity) return

  document.querySelector('.popup-overlay')?.remove()

  const overlay = document.createElement('div')
  overlay.className = 'popup-overlay'

  const dialog = document.createElement('div')
  dialog.className = 'popup popup--entity'
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')

  dialog.appendChild(EntityDetail({ entity, onBack: () => overlay.remove() }))
  overlay.appendChild(dialog)
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })
  document.body.appendChild(overlay)
}

const log: RollEntry[] = []
let logCollapsed = true
let lastEntry: RollEntry | null = null

export function TablesView(): HTMLElement {
  const tables = getTables()

  const el = document.createElement('div')
  el.className = 'view tables-view'

  const promptArea = document.createElement('div')
  promptArea.className = 'tables-view__prompt'
  promptArea.hidden = true

  const resultArea = document.createElement('div')
  resultArea.className = 'tables-view__result'
  resultArea.hidden = lastEntry === null

  if (lastEntry !== null) {
    resultArea.appendChild(RollResult(lastEntry, 0, { onEntityClick: openEntityDetail }))
  }

  const logContainer = document.createElement('div')
  logContainer.className = 'tables-view__log'

  function refreshLog() {
    logContainer.innerHTML = ''
    logContainer.appendChild(
      SessionLog({
        entries: log,
        collapsed: logCollapsed,
        onToggle: () => {
          logCollapsed = !logCollapsed
          refreshLog()
        },
        onEntityClick: openEntityDetail,
      })
    )
  }

  function showPrompt(promptEl: HTMLElement) {
    promptArea.innerHTML = ''
    promptArea.appendChild(promptEl)
    promptArea.hidden = false
  }

  function hidePrompt() {
    promptArea.innerHTML = ''
    promptArea.hidden = true
  }

  function promptForInput(table: RolledTable): Promise<string> {
    return new Promise(resolve => {
      showPrompt(
        InputPrompt({
          tableName: table.name,
          input: table.requiresInput!,
          onConfirm: selected => {
            hidePrompt()
            resolve(selected)
          },
        })
      )
    })
  }

  async function handleSelect(table: RolledTable) {
    hidePrompt()
    resultArea.hidden = true

    const input = table.requiresInput ? await promptForInput(table) : undefined
    const entry = await rollTable(table, input, promptForInput)

    lastEntry = entry
    resultArea.innerHTML = ''
    resultArea.appendChild(RollResult(entry, 0, { onEntityClick: openEntityDetail }))
    resultArea.hidden = false

    log.push(entry)
    refreshLog()
  }

  el.appendChild(TableSelector({ tables, onSelect: handleSelect }))
  el.appendChild(promptArea)
  el.appendChild(resultArea)
  el.appendChild(logContainer)

  refreshLog()

  return el
}
