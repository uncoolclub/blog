import { decodeEntities } from './html-entities'
import type { Book } from '../server/posts'

export type BookSearchResult = Pick<
  Book,
  | 'title'
  | 'author'
  | 'translator'
  | 'publisher'
  | 'coverUrl'
  | 'coverFallbackUrl'
  | 'isbn'
>

export interface KakaoBookDocument {
  title?: string
  authors?: string[]
  translators?: string[]
  publisher?: string
  thumbnail?: string
  isbn?: string
}

const clean = (value?: string) => decodeEntities(value ?? '').trim()

const joinNames = (names?: string[]) =>
  [...new Set((names ?? []).map(clean).filter(Boolean))].join(', ')

export function pickIsbn(raw?: string): string | undefined {
  const parts = clean(raw)
    .split(/\s+/)
    .map((part) => part.replace(/-/g, ''))
    .filter((part) => /^(?:\d{13}|\d{9}[\dXx])$/.test(part))
  return parts.find((part) => part.length === 13) ?? parts[0]
}

export function isKakaoCover(url: string): boolean {
  try {
    const { protocol, hostname, pathname, port, username, password } =
      new URL(url)
    if (protocol !== 'https:' || port || username || password) return false
    return (
      (/^search\d*\.kakaocdn\.net$/.test(hostname) &&
        pathname.startsWith('/thumb/')) ||
      (hostname === 't1.daumcdn.net' && pathname.startsWith('/lbook/image/'))
    )
  } catch {
    return false
  }
}

function coverOf(thumbnail?: string): string | undefined {
  const url = clean(thumbnail).replace(/^http:\/\//i, 'https://')
  return url.startsWith('https://') ? url : undefined
}

function originalCoverOf(thumbnail: string): string | undefined {
  try {
    const fname = new URL(thumbnail).searchParams.get('fname')
    if (!fname) return undefined
    const url = new URL(fname)
    url.protocol = 'https:'
    return url.hostname === 't1.daumcdn.net' && isKakaoCover(url.href)
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}

export function toSearchResults(
  documents: KakaoBookDocument[],
): BookSearchResult[] {
  const seen = new Set<string>()
  const results: BookSearchResult[] = []
  for (const doc of documents) {
    const title = clean(doc.title)
    if (!title) continue
    const isbn = pickIsbn(doc.isbn)
    const key = isbn ?? `${title}|${clean(doc.publisher)}`
    if (seen.has(key)) continue
    seen.add(key)
    const thumbnail = coverOf(doc.thumbnail)
    const original = thumbnail && originalCoverOf(thumbnail)
    results.push({
      title,
      author: joinNames(doc.authors),
      translator: joinNames(doc.translators) || undefined,
      publisher: clean(doc.publisher) || undefined,
      coverUrl: original || thumbnail,
      coverFallbackUrl: original ? thumbnail : undefined,
      isbn,
    })
  }
  return results
}
