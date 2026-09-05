interface EntityCardProps {
  name: string
  meta?: string
  onClick: () => void
}

export function EntityCard({ name, meta, onClick }: EntityCardProps): HTMLElement {
  const card = document.createElement('button')
  card.className = 'entity-card card'

  const left = document.createElement('span')
  left.className = 'entity-card__left'

  const nameEl = document.createElement('span')
  nameEl.className = 'entity-card__name'
  nameEl.textContent = name
  left.appendChild(nameEl)

  if (meta) {
    const metaEl = document.createElement('span')
    metaEl.className = 'entity-card__meta'
    metaEl.textContent = meta
    left.appendChild(metaEl)
  }

  const chevron = document.createElement('span')
  chevron.className = 'entity-card__chevron'
  chevron.textContent = '›'
  chevron.setAttribute('aria-hidden', 'true')

  card.appendChild(left)
  card.appendChild(chevron)
  card.addEventListener('click', onClick)

  return card
}
