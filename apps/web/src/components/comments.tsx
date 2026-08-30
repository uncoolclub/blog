import { useEffect, useRef } from 'react'

const GISCUS = {
  repo: 'uncoolclub/blog',
  repoId: 'R_kgDOQcDIMQ',
  category: 'Announcements',
  categoryId: 'DIC_kwDOQcDIMc4DEBbd',
}

function themeUrl() {
  const set = document.documentElement.dataset.theme
  const dark = set ? set === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  return `https://blog.th3shu.dev/giscus-${dark ? 'dark' : 'light'}.css`
}

export function Comments() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!GISCUS.repo || !ref.current || ref.current.hasChildNodes()) return
    const s = document.createElement('script')
    s.src = 'https://giscus.app/client.js'
    s.async = true
    s.crossOrigin = 'anonymous'
    Object.entries({
      'data-repo': GISCUS.repo,
      'data-repo-id': GISCUS.repoId,
      'data-category': GISCUS.category,
      'data-category-id': GISCUS.categoryId,
      'data-mapping': 'pathname',
      'data-reactions-enabled': '1',
      'data-input-position': 'bottom',
      'data-theme': themeUrl(),
      'data-lang': 'ko',
    }).forEach(([k, v]) => s.setAttribute(k, v))
    ref.current.appendChild(s)
  }, [])

  useEffect(() => {
    const sync = () => {
      const frame = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
      frame?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: themeUrl() } } },
        'https://giscus.app',
      )
    }
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const media = matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', sync)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', sync)
    }
  }, [])

  if (!GISCUS.repo) return null
  return <div className="comments" ref={ref} />
}
