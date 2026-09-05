export function LookupView(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'view'
  el.textContent = 'Lookup'
  return el
}
