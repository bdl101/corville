import type { RollEntry } from '../logic/roller'

export function RollResult(entry: RollEntry, depth = 0): HTMLElement {
  const el = document.createElement('div')
  el.className = depth === 0 ? 'roll-result' : 'roll-result roll-result--chained'

  const header = document.createElement('div')
  header.className = 'roll-result__header'

  const tableName = document.createElement('span')
  tableName.className = 'roll-result__table-name'
  tableName.textContent = entry.table.name

  const rolled = document.createElement('span')
  rolled.className = 'roll-result__rolled'
  rolled.textContent = `Rolled ${entry.rolledValue} on d${entry.table.die}`

  header.appendChild(tableName)
  header.appendChild(rolled)
  el.appendChild(header)

  if (entry.input) {
    const inputEl = document.createElement('div')
    inputEl.className = 'roll-result__input'
    inputEl.textContent = entry.input
    el.appendChild(inputEl)
  }

  const text = document.createElement('div')
  text.className = 'roll-result__text'
  text.textContent = entry.result.text
  el.appendChild(text)

  if (entry.chains?.length) {
    const chainsEl = document.createElement('div')
    chainsEl.className = 'roll-result__chains'
    for (const chain of entry.chains) {
      chainsEl.appendChild(RollResult(chain, depth + 1))
    }
    el.appendChild(chainsEl)
  }

  return el
}
