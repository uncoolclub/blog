import { useEffect, useRef } from 'react'

const GISCUS = {
  repo: 'uncoolclub/blog',
  repoId: 'R_kgDOQcDIMQ',
  category: 'Announcements',
  categoryId: 'DIC_kwDOQcDIMc4DEBbd',
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
      'data-theme': 'preferred_color_scheme',
      'data-lang': 'ko',
    }).forEach(([k, v]) => s.setAttribute(k, v))
    ref.current.appendChild(s)
  }, [])

  if (!GISCUS.repo) return null
  return <div className="comments" ref={ref} />
}
