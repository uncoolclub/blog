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

function addCopyButtons(root: HTMLElement) {
  for (const pre of root.querySelectorAll('pre')) {
    if (pre.querySelector('.code-copy')) continue
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'code-copy'
    btn.textContent = '복사'
    btn.addEventListener('click', () => {
      void navigator.clipboard.writeText(
        pre.querySelector('code')?.textContent ?? '',
      )
      btn.textContent = '복사됨'
      btn.dataset.copied = ''
      setTimeout(() => {
        btn.textContent = '복사'
        delete btn.dataset.copied
      }, 1500)
    })
    pre.appendChild(btn)
  }
}

// 유튜브 임베드는 정적으로 섬네일만 렌더되고, 클릭 시 iframe으로 교체된다.
function hydrateYouTube(root: HTMLElement) {
  for (const fig of root.querySelectorAll<HTMLElement>(
    '.embed-youtube[data-youtube-id]',
  )) {
    const frame = fig.querySelector<HTMLElement>('.embed-frame')
    if (!frame) continue
    frame.addEventListener(
      'click',
      () => {
        const iframe = document.createElement('iframe')
        iframe.src = `https://www.youtube-nocookie.com/embed/${fig.dataset.youtubeId}?autoplay=1`
        iframe.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        iframe.allowFullscreen = true
        iframe.title = fig.dataset.title ?? 'YouTube 영상'
        frame.replaceChildren(iframe)
      },
      { once: true },
    )
  }
}

/** 읽기 화면 전용 후처리: 하이라이트 + 복사 버튼 + 유튜브 클릭 재생. */
export function enhancePost(root: HTMLElement) {
  highlightCodeBlocks(root)
  addCopyButtons(root)
  hydrateYouTube(root)
}
