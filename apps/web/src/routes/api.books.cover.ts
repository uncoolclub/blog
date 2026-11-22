import { createFileRoute } from '@tanstack/react-router'
import { isKakaoCover } from '../lib/kakao-book'
import { assertAdmin } from '../server/posts'

const MAX_BYTES = 2 * 1024 * 1024

export const Route = createFileRoute('/api/books/cover')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await assertAdmin()
        const url = new URL(request.url).searchParams.get('url') ?? ''
        if (!isKakaoCover(url)) return new Response(null, { status: 400 })
        try {
          const res = await fetch(url, {
            redirect: 'manual',
            signal: AbortSignal.timeout(8000),
          })
          const type = res.headers.get('content-type') ?? ''
          if (!res.ok || !type.startsWith('image/')) {
            return new Response(null, { status: 502 })
          }
          const body = await res.arrayBuffer()
          if (body.byteLength > MAX_BYTES) {
            return new Response(null, { status: 502 })
          }
          return new Response(body, {
            headers: { 'content-type': type, 'cache-control': 'no-store' },
          })
        } catch {
          return new Response(null, { status: 502 })
        }
      },
    },
  },
})
