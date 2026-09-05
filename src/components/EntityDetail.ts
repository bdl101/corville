import type {
  Creature, Item, Attack, Feature, RRTable, CraftingRecipe,
  HumanCreature, MonsterCreature, WeaponItem, ArmorItem, AmmoItem,
  ConsumableItem, MagicItem, BookItem, ToolItem, GearItem,
} from '../types'
import { KEYWORD_DESCRIPTIONS } from '../data/keywords'
import { showPopup } from '../utils/popup'

interface EntityDetailProps {
  entity: Creature | Item
  onBack: () => void
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  if (className) e.className = className
  if (text !== undefined) e.textContent = text
  return e
}

function badge(text: string): HTMLElement {
  return el('span', 'badge', text)
}

function section(title: string): { wrapper: HTMLElement; body: HTMLElement } {
  const wrapper = el('div', 'entity-detail__section')
  wrapper.appendChild(el('p', 'entity-detail__section-title', title))
  const body = el('div')
  wrapper.appendChild(body)
  return { wrapper, body }
}

function field(label: string, value: string): HTMLElement {
  const p = el('p', 'item-detail__field')
  const strong = el('strong', undefined, `${label}: `)
  p.appendChild(strong)
  p.appendChild(document.createTextNode(value))
  return p
}

function renderAttacks(attacks: Attack[]): HTMLElement {
  const { wrapper, body } = section('Attacks')
  const table = el('table', 'attacks-table')
  const thead = el('thead')
  const headerRow = el('tr')
  for (const h of ['Name', 'Range', '12–16', '17+']) {
    headerRow.appendChild(el('th', undefined, h))
  }
  thead.appendChild(headerRow)
  table.appendChild(thead)

  const tbody = el('tbody')
  for (const atk of attacks) {
    const row = el('tr')
    const nameCell = el('td', undefined, atk.name)
    if (atk.note) {
      nameCell.title = atk.note
    }
    row.appendChild(nameCell)
    row.appendChild(el('td', undefined, atk.range))
    row.appendChild(el('td', undefined, atk.tier2))
    row.appendChild(el('td', undefined, atk.tier3))
    tbody.appendChild(row)
  }
  table.appendChild(tbody)
  body.appendChild(table)
  return wrapper
}

function renderFeatures(features: Feature[]): HTMLElement {
  const { wrapper, body } = section('Features')
  body.className = 'features-list'
  for (const feat of features) {
    const item = el('div', 'feature')
    const nameText = feat.uses ? `${feat.name} — ${feat.uses}` : feat.name
    item.appendChild(el('p', 'feature__name', nameText))
    item.appendChild(el('p', 'feature__description', feat.description))
    body.appendChild(item)
  }
  return wrapper
}

function renderRRTable(rr: RRTable): HTMLElement {
  const table = el('table', 'rr-table')
  const thead = el('thead')
  const headerRow = el('tr')
  if (rr.tier1) headerRow.appendChild(el('th', undefined, '≤11'))
  headerRow.appendChild(el('th', undefined, '12–16'))
  headerRow.appendChild(el('th', undefined, '17+'))
  thead.appendChild(headerRow)
  table.appendChild(thead)

  const tbody = el('tbody')
  const row = el('tr')
  if (rr.tier1) row.appendChild(el('td', undefined, rr.tier1))
  row.appendChild(el('td', undefined, rr.tier2))
  row.appendChild(el('td', undefined, rr.tier3))
  tbody.appendChild(row)
  table.appendChild(tbody)
  return table
}

function renderCrafting(crafting: CraftingRecipe): HTMLElement {
  return field('Crafting', `${crafting.skill}, ${crafting.materials}, ${crafting.time} min`)
}

function renderCreature(creature: Creature): DocumentFragment {
  const frag = document.createDocumentFragment()

  // Header
  const header = el('div', 'entity-detail__header')

  const nameRow = el('div', 'entity-detail__name-row')
  nameRow.appendChild(el('h1', 'entity-detail__name', creature.name))
  nameRow.appendChild(badge(creature.type))

  // Monster: colloquial names as subtitle above name row
  if (creature.type !== 'Animal' && creature.type !== 'Human') {
    const monster = creature as MonsterCreature
    if (monster.colloquialNames && monster.colloquialNames.length > 0) {
      header.appendChild(el('p', 'entity-detail__subtitle', monster.colloquialNames.join(', ')))
    }
  }

  header.appendChild(nameRow)

  const statsRow1 = el('div', 'entity-detail__stats')

  // Monster: reactions if not 1
  if (creature.type !== 'Animal' && creature.type !== 'Human') {
    const monster = creature as MonsterCreature
    if (monster.reactions !== undefined && monster.reactions !== 1) {
      const reactionStat = el('span')
      reactionStat.appendChild(document.createTextNode('Reactions: '))
      reactionStat.appendChild(el('strong', undefined, String(monster.reactions)))
      statsRow1.appendChild(reactionStat)
    }
  }

  for (const [label, value] of [
    ['Size', creature.size],
    ['Power', String(creature.power)],
    ['Stamina', String(creature.stamina)],
  ] as [string, string][]) {
    const span = el('span')
    span.appendChild(document.createTextNode(`${label}: `))
    span.appendChild(el('strong', undefined, value))
    statsRow1.appendChild(span)
  }

  header.appendChild(statsRow1)

  const statsRow2 = el('div', 'entity-detail__stats')
  for (const [label, value] of [
    ['Speed', creature.speed],
    ['Agility', String(creature.agility)],
    ['Mind', String(creature.mind)],
    ['Strength', String(creature.strength)],
  ] as [string, string][]) {
    const span = el('span')
    span.appendChild(document.createTextNode(`${label}: `))
    span.appendChild(el('strong', undefined, value))
    statsRow2.appendChild(span)
  }
  header.appendChild(statsRow2)
  frag.appendChild(header)

  frag.appendChild(renderAttacks(creature.attacks))

  // Human-only fields (rendered after attacks, before features)
  if (creature.type === 'Human') {
    const human = creature as HumanCreature
    const { wrapper, body } = section('Details')
    if (human.ad) body.appendChild(field('AD', human.ad))
    if (human.expertises.length > 0) body.appendChild(field('Expertises', human.expertises.join(', ')))
    if (human.equipment.length > 0) body.appendChild(field('Equipment', human.equipment.join(', ')))
    frag.appendChild(wrapper)
  }

  if (creature.features.length > 0) {
    frag.appendChild(renderFeatures(creature.features))
  }

  return frag
}

function renderItem(item: Item): DocumentFragment {
  const frag = document.createDocumentFragment()

  const header = el('div', 'entity-detail__header')
  header.appendChild(el('h1', 'entity-detail__name', item.name))
  frag.appendChild(header)

  const body = el('div', 'entity-detail__section')

  if (item.category === 'weapon') {
    const w = item as WeaponItem
    const kwRow = el('div', 'keywords')
    for (const kw of w.keywords) {
      const btn = el('button', 'badge badge--keyword', kw)
      btn.addEventListener('click', () => showPopup(kw, KEYWORD_DESCRIPTIONS[kw] ?? ''))
      kwRow.appendChild(btn)
    }
    body.appendChild(kwRow)
    body.appendChild(field('Attack', w.attackStat))
    body.appendChild(field('Range', w.range))

    const table = el('table', 'rr-table')
    const thead = el('thead')
    const hr = el('tr')
    hr.appendChild(el('th', undefined, '12–16'))
    hr.appendChild(el('th', undefined, '17+'))
    thead.appendChild(hr)
    table.appendChild(thead)
    const tbody = el('tbody')
    const tr = el('tr')
    tr.appendChild(el('td', undefined, w.tier2))
    tr.appendChild(el('td', undefined, w.tier3))
    tbody.appendChild(tr)
    table.appendChild(tbody)
    body.appendChild(table)

    body.appendChild(field('Slots', String(w.slots)))
    body.appendChild(field('Stack', String(w.stack)))
    if (w.crafting) body.appendChild(renderCrafting(w.crafting))
    if (w.cost !== undefined) body.appendChild(field('Cost', `${w.cost}g`))
  } else if (item.category === 'armor') {
    const a = item as ArmorItem
    header.appendChild(badge(`AD: ${a.ad}`))
    body.appendChild(field('Slots', String(a.slots)))
    body.appendChild(field('Stack', String(a.stack)))
    if (a.crafting) body.appendChild(renderCrafting(a.crafting))
    if (a.cost !== undefined) body.appendChild(field('Cost', `${a.cost}g`))
  } else if (item.category === 'ammo') {
    const a = item as AmmoItem
    body.appendChild(field('For', a.ammoFor))
    if (a.ud) body.appendChild(field('UD', a.ud))
    if (a.cost !== undefined) body.appendChild(field('Cost', `${a.cost}g`))
  } else if (item.category === 'consumable') {
    const c = item as ConsumableItem
    if (c.ud) body.appendChild(field('UD', c.ud))
    if (c.maneuver) body.appendChild(field('Maneuver', c.maneuver))
    if (c.action) body.appendChild(field('Action', c.action))
    if (c.rrTable) body.appendChild(renderRRTable(c.rrTable))
    if (c.crafting) body.appendChild(renderCrafting(c.crafting))
    if (c.cost !== undefined) body.appendChild(field('Cost', `${c.cost}g`))
  } else if (item.category === 'magic') {
    const m = item as MagicItem
    if (m.slot) header.appendChild(badge(m.slot))
    if (m.ud) body.appendChild(field('UD', m.ud))
    if (m.maneuver) body.appendChild(field('Maneuver', m.maneuver))
    if (m.action) body.appendChild(field('Action', m.action))
    if (m.rrTable) body.appendChild(renderRRTable(m.rrTable))
    if (m.crafting) body.appendChild(renderCrafting(m.crafting))
    if (m.cost !== undefined) body.appendChild(field('Cost', `${m.cost}g`))
  } else if (item.category === 'book') {
    const b = item as BookItem
    header.appendChild(badge(`R${b.rank}`))
    body.appendChild(field('School', b.school))
    body.appendChild(field('Action', b.actionType))
    body.appendChild(field('Range', b.range))
    if (b.target) body.appendChild(field('Target', b.target))
    body.appendChild(field('Duration', b.duration))
    body.appendChild(field('UD', String(item.stack)))
    if (b.rrTable) body.appendChild(renderRRTable(b.rrTable))
    if (b.cost !== undefined) body.appendChild(field('Cost', `${b.cost}g`))
  } else if (item.category === 'tool') {
    const t = item as ToolItem
    if (t.description) body.appendChild(el('p', 'item-detail__desc', t.description))
    if (t.fine) body.appendChild(field('Fine', t.fine))
    if (t.masterwork) body.appendChild(field('Masterwork', t.masterwork))
    if (t.crafting) body.appendChild(renderCrafting(t.crafting))
    if (t.cost !== undefined) body.appendChild(field('Cost', `${t.cost}g`))
  } else if (item.category === 'gear') {
    const g = item as GearItem
    if (g.description) body.appendChild(el('p', 'item-detail__desc', g.description))
    if (g.maneuver) body.appendChild(field('Maneuver', g.maneuver))
    if (g.action) body.appendChild(field('Action', g.action))
    if (g.rrTable) body.appendChild(renderRRTable(g.rrTable))
    if (g.fine) body.appendChild(field('Fine', g.fine))
    if (g.masterwork) body.appendChild(field('Masterwork', g.masterwork))
    if (g.crafting) body.appendChild(renderCrafting(g.crafting))
    if (g.cost !== undefined) body.appendChild(field('Cost', `${g.cost}g`))
  } else if (item.category === 'treasure') {
    if (item.description) body.appendChild(el('p', 'item-detail__desc', item.description))
  }

  frag.appendChild(body)
  return frag
}

export function EntityDetail({ entity, onBack }: EntityDetailProps): HTMLElement {
  const wrapper = el('div', 'entity-detail')

  const backBtn = el('button', 'btn btn--ghost entity-detail__back', '← Back')
  backBtn.addEventListener('click', onBack)
  wrapper.appendChild(backBtn)

  const content = document.createDocumentFragment()
  if ('type' in entity) {
    content.appendChild(renderCreature(entity as Creature))
  } else {
    content.appendChild(renderItem(entity as Item))
  }
  wrapper.appendChild(content)

  return wrapper
}
