import { createFileRoute } from '@tanstack/react-router'
import { youtubeIdOf } from '@blog/editor/html'
import type { EmbedMeta } from '@blog/editor/html'
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

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
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

  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(8000),
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; blog-unfurl/1.0)',
      accept: 'text/html',
    },
  })
  if (!res.ok || !res.headers.get('content-type')?.includes('text/html')) {
    return { url }
  }
  // OG 태그는 head에 있으므로 앞부분만 봐도 충분하다.
  const html = (await res.text()).slice(0, 300_000)
  const image = metaContent(html, 'og:image')
  return {
    url,
    title:
      metaContent(html, 'og:title') ??
      decodeEntities(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ?? ''),
    description:
      metaContent(html, 'og:description') ?? metaContent(html, 'description'),
    // 상대 경로 이미지는 절대 URL로 보정
    image: image ? new URL(image, res.url).href : undefined,
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
        if (target.protocol !== 'https:' && target.protocol !== 'http:') {
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
