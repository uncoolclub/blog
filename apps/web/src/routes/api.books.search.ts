import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { toSearchResults } from '../lib/kakao-book'
import type { KakaoBookDocument } from '../lib/kakao-book'
import { assertAdmin } from '../server/posts'

const MAX_QUERY = 100

const failure = (error: string, status: number) =>
  Response.json({ error }, { status, headers: { 'cache-control': 'no-store' } })

export const Route = createFileRoute('/api/books/search')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await assertAdmin()
        const query = new URL(request.url).searchParams.get('q')?.trim() ?? ''
        if (!query || query.length > MAX_QUERY) {
          return failure('invalid_query', 400)
        }
        const key = env.KAKAO_REST_API_KEY
        if (!key) return failure('missing_key', 503)

        const upstream = new URL('https://dapi.kakao.com/v3/search/book')
        upstream.searchParams.set('query', query)
        upstream.searchParams.set('size', '10')
        try {
          const res = await fetch(upstream, {
            headers: { authorization: `KakaoAK ${key}` },
            signal: AbortSignal.timeout(8000),
          })
          if (!res.ok) return failure('upstream', 502)
          const { documents } = (await res.json()) as {
            documents?: KakaoBookDocument[]
          }
          return Response.json(
            { results: toSearchResults(documents ?? []) },
            { headers: { 'cache-control': 'no-store' } },
          )
        } catch {
          return failure('upstream', 502)
        }
      },
    },
  },
})
