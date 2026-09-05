export function showPopup(title: string, body: string): void {
  document.querySelector('.popup-overlay')?.remove()

  const overlay = document.createElement('div')
  overlay.className = 'popup-overlay'

  const dialog = document.createElement('div')
  dialog.className = 'popup'
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-label', title)

  const header = document.createElement('div')
  header.className = 'popup__header'

  const titleEl = document.createElement('span')
  titleEl.className = 'popup__title'
  titleEl.textContent = title

  const closeBtn = document.createElement('button')
  closeBtn.className = 'popup__close btn btn--ghost'
  closeBtn.textContent = '×'
  closeBtn.setAttribute('aria-label', 'Close')
  closeBtn.addEventListener('click', () => overlay.remove())

  header.appendChild(titleEl)
  header.appendChild(closeBtn)

  const content = document.createElement('p')
  content.className = 'popup__body'
  content.textContent = body || '(No description yet)'

  dialog.appendChild(header)
  dialog.appendChild(content)
  overlay.appendChild(dialog)

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove()
  })

  document.body.appendChild(overlay)
  closeBtn.focus()
}

export function showEntityPopup(content: HTMLElement, onClose: () => void): void {
  document.querySelector('.popup-overlay')?.remove()

  const overlay = document.createElement('div')
  overlay.className = 'popup-overlay'

  const dialog = document.createElement('div')
  dialog.className = 'popup popup--entity'
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')

  dialog.appendChild(content)
  overlay.appendChild(dialog)

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove()
      onClose()
    }
  })

  document.body.appendChild(overlay)
}
