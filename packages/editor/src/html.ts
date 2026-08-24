import type { JSONContent } from '@tiptap/core'
import { renderToHTMLString } from '@tiptap/static-renderer'
import { baseExtensions } from './extensions'

export type { JSONContent }
export { youtubeIdOf } from './embed'
export type { EmbedMeta } from './embed'

export function renderPostHTML(content: JSONContent): string {
  return renderToHTMLString({ content, extensions: baseExtensions() })
}
