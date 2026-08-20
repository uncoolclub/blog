import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'

export const Route = createFileRoute('/api/images/$key')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const object = await env.IMAGES.get(params.key)
        if (!object) return new Response('Not Found', { status: 404 })
        return new Response(object.body, {
          headers: {
            'Content-Type':
              object.httpMetadata?.contentType ?? 'application/octet-stream',
            // key가 UUID라 내용이 바뀔 일이 없다 → 영구 캐시
            'Cache-Control': 'public, max-age=31536000, immutable',
            ETag: object.httpEtag,
          },
        })
      },
    },
  },
})
