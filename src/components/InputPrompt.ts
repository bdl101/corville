import type { TableInput } from '../types'

interface InputPromptOptions {
  tableName: string
  input: TableInput
  onConfirm: (selected: string) => void
}

export function InputPrompt({ tableName, input, onConfirm }: InputPromptOptions): HTMLElement {
  const el = document.createElement('div')
  el.className = 'input-prompt'

  const title = document.createElement('div')
  title.className = 'input-prompt__title'
  title.textContent = tableName

  const prompt = document.createElement('p')
  prompt.className = 'input-prompt__text'
  prompt.textContent = input.prompt

  const options = document.createElement('div')
  options.className = 'input-prompt__options'

  for (const option of input.options) {
    const btn = document.createElement('button')
    btn.className = 'btn'
    btn.textContent = option
    btn.addEventListener('click', () => onConfirm(option))
    options.appendChild(btn)
  }

  el.appendChild(title)
  el.appendChild(prompt)
  el.appendChild(options)
  return el
}
