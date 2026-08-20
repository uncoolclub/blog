import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { assertAdmin } from '../server/posts'

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
}

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await assertAdmin()
        const form = await request.formData()
        const file = form.get('file')
        if (!(file instanceof File) || !EXT[file.type]) {
          return Response.json({ error: 'unsupported file' }, { status: 400 })
        }
        const key = `${crypto.randomUUID()}.${EXT[file.type]}`
        await env.IMAGES.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        })
        return Response.json({ url: `/api/images/${key}` })
      },
    },
  },
})
