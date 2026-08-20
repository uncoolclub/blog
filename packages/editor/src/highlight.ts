// generateHTML은 에디터 데코레이션(신택스 하이라이트)을 포함하지 않으므로,
// 발행 글에서는 클라이언트에서 한 번 하이라이트를 입힌다.
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
