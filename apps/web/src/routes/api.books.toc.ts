import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { parseToc } from '../lib/yes24-toc'
import { assertAdmin } from '../server/posts'

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } })

export const Route = createFileRoute('/api/books/toc')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await assertAdmin()
        const isbn = new URL(request.url).searchParams.get('isbn') ?? ''
        if (!/^\d{13}$/.test(isbn)) return json({ error: 'invalid_isbn' }, 400)
        const key = env.YES24_API_KEY
        if (!key) return json({ error: 'missing_key' }, 503)

        const upstream = new URL('https://apis.yes24.com/v1/goods/content')
        upstream.searchParams.set('searchType', 'ISBN13')
        upstream.searchParams.set('query', isbn)
        try {
          const res = await fetch(upstream, {
            headers: { 'x-api-key': key },
            redirect: 'manual',
            signal: AbortSignal.timeout(8000),
          })
          if (res.status === 404) return json({ toc: [] })
          if (!res.ok) return json({ error: 'upstream' }, 502)
          const body = (await res.json()) as {
            data?: { data?: { itemId?: number; contents?: string } }
          }
          const item = body.data?.data
          return json({
            toc: parseToc(item?.contents),
            itemId: Number.isSafeInteger(item?.itemId) ? item?.itemId : undefined,
          })
        } catch {
          return json({ error: 'upstream' }, 502)
        }
      },
    },
  },
})
