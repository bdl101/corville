import { getTables } from '../data/loader'
import { rollTable } from '../logic/roller'
import type { RollEntry } from '../logic/roller'
import type { RolledTable } from '../types'
import { TableSelector } from '../components/TableSelector'
import { InputPrompt } from '../components/InputPrompt'
import { RollResult } from '../components/RollResult'
import { SessionLog } from '../components/SessionLog'

export function TablesView(): HTMLElement {
  const tables = getTables()
  const log: RollEntry[] = []
  let logCollapsed = true

  const el = document.createElement('div')
  el.className = 'view tables-view'

  const promptArea = document.createElement('div')
  promptArea.className = 'tables-view__prompt'
  promptArea.hidden = true

  const resultArea = document.createElement('div')
  resultArea.className = 'tables-view__result'
  resultArea.hidden = true

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

    resultArea.innerHTML = ''
    resultArea.appendChild(RollResult(entry))
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
