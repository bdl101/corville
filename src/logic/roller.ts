import type { RolledTable, TableResult } from '../types'
import { getTableById } from '../data/loader'

export interface ResolvedEntityRef {
  id: string
  count: number
}

export interface RollEntry {
  table: RolledTable
  rolledValue: number
  result: TableResult
  resolvedText: string
  input?: string
  chains?: RollEntry[]
  resolvedEntityRefs?: ResolvedEntityRef[]
}

function rollDiceExpr(expr: string): number {
  const match = expr.match(/^(\d+)d(\d+)$/i)
  if (!match) return parseInt(expr, 10) || 1
  let total = 0
  const count = parseInt(match[1], 10)
  const sides = parseInt(match[2], 10)
  for (let i = 0; i < count; i++) total += Math.ceil(Math.random() * sides)
  return total
}

function resolveInlineRolls(text: string): string {
  return text.replace(/\b(\d+)d(\d+)\b/gi, (match, count, sides) => {
    let total = 0
    const c = parseInt(count, 10)
    const s = parseInt(sides, 10)
    for (let i = 0; i < c; i++) total += Math.ceil(Math.random() * s)
    return `${total} (${match})`
  })
}

const MAX_CHAIN_DEPTH = 8

export async function rollTable(
  table: RolledTable,
  input: string | undefined,
  onNeedsInput: (t: RolledTable) => Promise<string>,
  depth = 0
): Promise<RollEntry> {
  const rolledValue = Math.ceil(Math.random() * table.die)
  const result = table.results.find(r => rolledValue >= r.range[0] && rolledValue <= r.range[1])!
  const inputChainIds: string[] = (input !== undefined ? table.inputChains?.[input] : undefined) ?? []
  const chains = await resolveChains(result, onNeedsInput, depth, inputChainIds)
  const resolvedEntityRefs = result.entityRefs?.map(ref => ({
    id: ref.id,
    count: typeof ref.count === 'number' ? ref.count : rollDiceExpr(String(ref.count)),
  }))
  return {
    table,
    rolledValue,
    result,
    resolvedText: resolveInlineRolls(result.text).replace('{roll}', String(rolledValue)),
    input,
    chains: chains.length ? chains : undefined,
    resolvedEntityRefs: resolvedEntityRefs?.length ? resolvedEntityRefs : undefined,
  }
}

export async function resolveChains(
  result: TableResult,
  onNeedsInput: (table: RolledTable) => Promise<string>,
  depth = 0,
  extraChainIds: string[] = []
): Promise<RollEntry[]> {
  if (depth >= MAX_CHAIN_DEPTH) return []

  const tableIds: string[] = []
  if (result.chain) tableIds.push(result.chain)
  if (result.chains) tableIds.push(...result.chains)
  tableIds.push(...extraChainIds)

  const entries: RollEntry[] = []
  for (const id of tableIds) {
    const table = getTableById(id)
    if (!table) continue
    const count = table.repeatDie ? Math.ceil(Math.random() * table.repeatDie) : 1
    for (let i = 0; i < count; i++) {
      const input = table.requiresInput ? await onNeedsInput(table) : undefined
      const entry = await rollTable(table, input, onNeedsInput, depth + 1)
      entries.push(entry)
    }
  }
  return entries
}
