import { toHtml } from 'hast-util-to-html'
import { lowlight } from './extensions'

export function highlightCodeBlocks(root: HTMLElement) {
  for (const code of root.querySelectorAll('pre > code')) {
    const lang = [...code.classList]
      .find((c) => c.startsWith('language-'))
      ?.slice('language-'.length)
    const text = code.textContent ?? ''
    const tree =
      lang && lowlight.registered(lang)
        ? lowlight.highlight(lang, text)
        : lowlight.highlightAuto(text)
    code.innerHTML = toHtml(tree)
  }
}
