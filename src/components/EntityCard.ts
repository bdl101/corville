interface EntityCardProps {
  name: string
  onClick: () => void
}

export function EntityCard({ name, onClick }: EntityCardProps): HTMLElement {
  const card = document.createElement('button')
  card.className = 'entity-card card'

  const nameEl = document.createElement('span')
  nameEl.className = 'entity-card__name'
  nameEl.textContent = name

  const chevron = document.createElement('span')
  chevron.className = 'entity-card__chevron'
  chevron.textContent = '›'
  chevron.setAttribute('aria-hidden', 'true')

  card.appendChild(nameEl)
  card.appendChild(chevron)
  card.addEventListener('click', onClick)

  return card
}
