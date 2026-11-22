import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { assertAdmin } from '../server/posts'

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

const tooLarge = () =>
  Response.json({ error: 'file too large' }, { status: 413 })

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await assertAdmin()
        const declaredLength = Number(request.headers.get('content-length'))
        if (Number.isFinite(declaredLength) && declaredLength > MAX_UPLOAD_BYTES) {
          return tooLarge()
        }
        const form = await request.formData()
        const file = form.get('file')
        if (!(file instanceof File) || !EXT[file.type]) {
          return Response.json({ error: 'unsupported file' }, { status: 400 })
        }
        if (file.size > MAX_UPLOAD_BYTES) return tooLarge()
        const key = `${crypto.randomUUID()}.${EXT[file.type]}`
        await env.IMAGES.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        })
        return Response.json({ url: `/api/images/${key}` })
      },
    },
  },
})
