import { decodeEntities } from './html-entities'
import type { BookTocEntry } from '../server/posts'

const MAX_ENTRIES = 200
const MAX_TITLE = 200
const LINE_BREAK = /<br\s*\/?>|<\/(?:p|div|li|tr)>/gi
const MARKUP =
  /<\/?(?:p|div|ul|ol|li|span|b|strong|em|i|u|font|table|tbody|tr|td)\b[^>]*>/gi

export function parseToc(contents?: string): BookTocEntry[] {
  if (!contents) return []
  return decodeEntities(contents)
    .replace(LINE_BREAK, '\n')
    .replace(MARKUP, '')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, MAX_ENTRIES)
    .map((title) => ({ title: title.slice(0, MAX_TITLE) }))
}
