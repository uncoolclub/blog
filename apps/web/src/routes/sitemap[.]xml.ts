import { createFileRoute } from '@tanstack/react-router'
import { queryPublishedRows } from '../server/posts'
import { absoluteUrl, escapeXml, toDate } from '../lib/site'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const rows = await queryPublishedRows()
        const latest = rows[0] ? toDate(rows[0].updated_at) : new Date()

        const entry = (path: string, lastmod: Date) =>
          `  <url>
    <loc>${escapeXml(absoluteUrl(path))}</loc>
    <lastmod>${lastmod.toISOString()}</lastmod>
  </url>`

        const urls = [
          entry('/', latest),
          entry('/about', latest),
          entry('/books', latest),
          ...rows.map((row) =>
            entry(`/posts/${row.slug}`, toDate(row.updated_at)),
          ),
        ].join('\n')

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
