import { createFileRoute } from '@tanstack/react-router'
import { youtubeIdOf } from '@blog/editor/html'
import type { EmbedMeta } from '@blog/editor/html'
import { decodeEntities } from '../lib/html-entities'
import { assertAdmin } from '../server/posts'

// OG 메타는 CORS 때문에 브라우저에서 못 가져오므로 여기서 대신 가져온다.
// 결과는 embed 노드 attrs에 저장되어, 읽기 화면은 외부 요청 없이 렌더된다.
// 어드민 전용(작성 시점 1회 호출)이라 캐시는 두지 않는다.

function metaContent(html: string, key: string): string | undefined {
  const tag = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`,
    'i',
  ).exec(html)?.[0]
  const content = tag && /content=["']([^"']*)["']/i.exec(tag)?.[1]
  return content ? decodeEntities(content) : undefined
}

const MAX_REDIRECTS = 3
const MAX_HTML_BYTES = 300_000
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])
const FETCH_HEADERS = {
  'user-agent': 'Mozilla/5.0 (compatible; blog-unfurl/1.0)',
  accept: 'text/html',
}

function isPublicIPv4(a: number, b: number, c: number): boolean {
  if (a === 0 || a === 10 || a === 127) return false
  if (a === 100 && b >= 64 && b <= 127) return false
  if (a === 169 && b === 254) return false
  if (a === 172 && b >= 16 && b <= 31) return false
  if (a === 192 && b === 0 && c === 0) return false
  if (a === 192 && b === 168) return false
  if (a === 198 && (b === 18 || b === 19)) return false
  if (a >= 224) return false
  return true
}

function isPublicIPv6(literal: string): boolean {
  const parts = literal.split(':')
  const first = parseInt(parts[0], 16)
  if (!Number.isFinite(first) || first < 0x2000 || first > 0x3fff) return false
  if (first === 0x2002 || first === 0x3fff) return false
  if (first === 0x2001) {
    const second = parts[1] === '' ? 0 : parseInt(parts[1], 16)
    if (second === 0 || second === 0xdb8) return false
  }
  return true
}

function isPublicHttpUrl(u: URL): boolean {
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
  if (u.username !== '' || u.password !== '') return false
  if (u.port !== '') return false
  const host = u.hostname.toLowerCase().replace(/\.$/, '')
  if (!host) return false
  if (host === 'localhost' || host.endsWith('.localhost')) return false
  if (host.endsWith('.local') || host.endsWith('.internal')) return false
  if (host.startsWith('[')) return isPublicIPv6(host.slice(1, -1))
  const quad = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)
  if (quad) return isPublicIPv4(Number(quad[1]), Number(quad[2]), Number(quad[3]))
  return true
}

async function readCapped(res: Response, max: number): Promise<string> {
  if (!res.body) return ''
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  let total = 0
  try {
    while (total < max) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = value.length > max - total ? value.slice(0, max - total) : value
      total += chunk.length
      text += decoder.decode(chunk, { stream: true })
    }
    text += decoder.decode()
  } finally {
    await reader.cancel().catch(() => {})
  }
  return text
}

async function fetchFollowingRedirects(
  startUrl: string,
  signal: AbortSignal,
): Promise<{ res: Response; finalUrl: URL }> {
  let current = new URL(startUrl)
  for (let redirects = 0; ; redirects++) {
    if (!isPublicHttpUrl(current)) throw new Error('blocked url')
    const res = await fetch(current, {
      redirect: 'manual',
      signal,
      headers: FETCH_HEADERS,
    })
    if (!REDIRECT_STATUSES.has(res.status)) return { res, finalUrl: current }
    await res.body?.cancel().catch(() => {})
    if (redirects >= MAX_REDIRECTS) throw new Error('too many redirects')
    const location = res.headers.get('location')
    if (!location) throw new Error('missing location')
    current = new URL(location, current)
  }
}

async function unfurl(url: string): Promise<EmbedMeta> {
  if (youtubeIdOf(url)) {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { signal: AbortSignal.timeout(8000) },
    )
    if (!res.ok) return { url }
    const o = (await res.json()) as { title?: string; author_name?: string }
    return { url, title: o.title, description: o.author_name, siteName: 'YouTube' }
  }

  const { res, finalUrl } = await fetchFollowingRedirects(
    url,
    AbortSignal.timeout(8000),
  )
  if (!res.ok || !res.headers.get('content-type')?.includes('text/html')) {
    await res.body?.cancel().catch(() => {})
    return { url }
  }
  // OG 태그는 head에 있으므로 앞부분만 봐도 충분하다.
  const html = await readCapped(res, MAX_HTML_BYTES)
  const rawImage = metaContent(html, 'og:image')
  let image: string | undefined
  if (rawImage) {
    try {
      const resolved = new URL(rawImage, finalUrl)
      if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
        image = resolved.href
      }
    } catch {
      image = undefined
    }
  }
  return {
    url,
    title:
      metaContent(html, 'og:title') ??
      decodeEntities(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ?? ''),
    description:
      metaContent(html, 'og:description') ?? metaContent(html, 'description'),
    // 상대 경로 이미지는 절대 URL로 보정
    image,
    siteName: metaContent(html, 'og:site_name'),
  }
}

export const Route = createFileRoute('/api/unfurl')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await assertAdmin()
        const raw = new URL(request.url).searchParams.get('url')
        let target: URL
        try {
          target = new URL(raw ?? '')
        } catch {
          return Response.json({ error: 'invalid url' }, { status: 400 })
        }
        if (!isPublicHttpUrl(target)) {
          return Response.json({ error: 'invalid url' }, { status: 400 })
        }
        try {
          return Response.json(await unfurl(target.href))
        } catch {
          return Response.json({ url: target.href })
        }
      },
    },
  },
})
