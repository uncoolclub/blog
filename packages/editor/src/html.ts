// 서버(Workers)에서 쓰는 렌더 경로. DOM 없이 JSON → HTML 문자열로 변환하고,
// @tiptap/react를 import하지 않는다.
import { renderToHTMLString } from '@tiptap/static-renderer'
import type { JSONContent } from '@tiptap/core'
import { baseExtensions } from './extensions'

export type { JSONContent }

export function renderPostHTML(content: JSONContent): string {
  return renderToHTMLString({ content, extensions: baseExtensions() })
}
