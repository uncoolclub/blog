import { createFileRoute } from '@tanstack/react-router'
import { isKakaoCover } from '../lib/kakao-book'
import { assertAdmin } from '../server/posts'

const MAX_BYTES = 2 * 1024 * 1024
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

async function readLimited(body: ReadableStream<Uint8Array> | null) {
  if (!body) return null
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_BYTES) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

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
          const type = (res.headers.get('content-type') ?? '')
            .split(';')[0]
            .trim()
            .toLowerCase()
          if (!res.ok || !IMAGE_TYPES.has(type)) {
            return new Response(null, { status: 502 })
          }
          const bytes = await readLimited(res.body)
          if (!bytes) return new Response(null, { status: 502 })
          return new Response(bytes, {
            headers: {
              'content-type': type,
              'cache-control': 'no-store',
              'content-security-policy': "default-src 'none'; sandbox",
              'cross-origin-resource-policy': 'same-origin',
              'x-content-type-options': 'nosniff',
            },
          })
        } catch {
          return new Response(null, { status: 502 })
        }
      },
    },
  },
})
