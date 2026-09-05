import type { RolledTable, TableResult } from '../types'
import { getTableById } from '../data/loader'

export interface RollEntry {
  table: RolledTable
  rolledValue: number
  result: TableResult
  resolvedText: string
  input?: string
  chains?: RollEntry[]
}

function resolveInlineRolls(text: string): string {
  return text.replace(/\b(\d+)d(\d+)\b/gi, (_, count, sides) => {
    let total = 0
    const c = parseInt(count, 10)
    const s = parseInt(sides, 10)
    for (let i = 0; i < c; i++) total += Math.ceil(Math.random() * s)
    return String(total)
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
  const chains = await resolveChains(result, onNeedsInput, depth)
  return {
    table,
    rolledValue,
    result,
    resolvedText: resolveInlineRolls(result.text),
    input,
    chains: chains.length ? chains : undefined,
  }
}

export async function resolveChains(
  result: TableResult,
  onNeedsInput: (table: RolledTable) => Promise<string>,
  depth = 0
): Promise<RollEntry[]> {
  if (depth >= MAX_CHAIN_DEPTH) return []

  const tableIds: string[] = []
  if (result.chain) tableIds.push(result.chain)
  if (result.chains) tableIds.push(...result.chains)

  const entries: RollEntry[] = []
  for (const id of tableIds) {
    const table = getTableById(id)
    if (!table) continue
    const input = table.requiresInput ? await onNeedsInput(table) : undefined
    const entry = await rollTable(table, input, onNeedsInput, depth + 1)
    entries.push(entry)
  }
  return entries
}
