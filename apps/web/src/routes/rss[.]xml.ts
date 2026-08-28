import { createFileRoute } from '@tanstack/react-router'
import { renderPostHTML } from '@blog/editor/html'
import type { JSONContent } from '@blog/editor/html'
import { queryPublishedRows } from '../server/posts'
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  absolutizeHtml,
  escapeXml,
  toDate,
} from '../lib/site'

export const Route = createFileRoute('/rss.xml')({
  server: {
    handlers: {
      GET: async () => {
        const rows = await queryPublishedRows()
        const items = rows
          .map((row) => {
            const url = absoluteUrl(`/posts/${row.slug}`)
            const html = absolutizeHtml(
              renderPostHTML(JSON.parse(row.content) as JSONContent),
            )
            return `    <item>
      <title>${escapeXml(row.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toDate(row.published_at ?? row.updated_at).toUTCString()}</pubDate>
      <content:encoded><![CDATA[${html}]]></content:encoded>
    </item>`
          })
          .join('\n')

        const lastBuild = rows[0]
          ? toDate(rows[0].published_at ?? rows[0].updated_at).toUTCString()
          : new Date().toUTCString()

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
