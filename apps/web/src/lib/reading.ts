import type { BookSummary } from '../server/posts'

export type ShelfSort = 'recent' | 'rating-low' | 'rating'

export interface ShelfBook {
  id: number
  slug: string | null
  title: string
  book: BookSummary | null
}

export interface ReadDate {
  y: number
  m: number
  d?: number
}

export interface CalendarDay {
  books: ShelfBook[]
  finished: boolean
}

const MAX_RANGE_DAYS = 1100

export const READING_START = { y: 2025, m: 11 }

export const isBeforeReadingStart = (y: number, m: number) =>
  y * 12 + m < READING_START.y * 12 + READING_START.m

export const clampReadingMonth = (y: number, m: number) =>
  isBeforeReadingStart(y, m) ? READING_START : { y, m }

const pad = (n: number) => String(n).padStart(2, '0')

export const dayKey = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`

export const monthKey = (y: number, m: number) => `${y}-${pad(m + 1)}`

export function parseReadDate(value?: string): ReadDate | null {
  const match = /^(\d{4})\.(\d{1,2})(?:\.(\d{1,2}))?$/.exec(value?.trim() ?? '')
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2]) - 1
  if (m < 0 || m > 11) return null
  if (!match[3]) return { y, m }
  const d = Number(match[3])
  const date = new Date(y, m, d)
  return date.getMonth() === m && date.getDate() === d ? { y, m, d } : null
}

function readRank(book: BookSummary | null): number {
  const date = parseReadDate(book?.readTo) ?? parseReadDate(book?.readFrom)
  return date ? date.y * 10000 + (date.m + 1) * 100 + (date.d ?? 32) : -1
}

export function sortShelf<T extends ShelfBook>(items: T[], sort: ShelfSort): T[] {
  return [...items].sort((a, b) => {
    const ratingA = a.book?.rating ?? -1
    const ratingB = b.book?.rating ?? -1
    const rankA = readRank(a.book)
    const rankB = readRank(b.book)
    if (sort === 'rating') return ratingB - ratingA || rankB - rankA
    if (sort === 'rating-low') {
      if (ratingA < 0 || ratingB < 0) return ratingB - ratingA
      return ratingA - ratingB || rankB - rankA
    }
    return rankB - rankA || ratingB - ratingA
  })
}

export function buildReadingDays(items: ShelfBook[]): Map<string, CalendarDay> {
  const days = new Map<string, CalendarDay>()
  const mark = (key: string, item: ShelfBook, finished: boolean) => {
    const day = days.get(key) ?? { books: [], finished: false }
    if (!day.books.includes(item)) day.books.push(item)
    day.finished ||= finished
    days.set(key, day)
  }

  for (const item of items) {
    const from = parseReadDate(item.book?.readFrom)
    const to = parseReadDate(item.book?.readTo)
    if (from?.d && to?.d) {
      const cursor = new Date(from.y, from.m, from.d)
      const end = new Date(to.y, to.m, to.d)
      for (let i = 0; cursor <= end && i < MAX_RANGE_DAYS; i++) {
        mark(
          dayKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()),
          item,
          false,
        )
        cursor.setDate(cursor.getDate() + 1)
      }
    } else if (from?.d) {
      mark(dayKey(from.y, from.m, from.d), item, false)
    }
    if (to?.d) mark(dayKey(to.y, to.m, to.d), item, true)
  }
  return days
}

export function booksInMonth<T extends ShelfBook>(
  items: T[],
  y: number,
  m: number,
): T[] {
  const target = y * 12 + m
  return items.filter((item) => {
    const from = parseReadDate(item.book?.readFrom)
    const to = parseReadDate(item.book?.readTo)
    const start = from ?? to
    const end = to ?? from
    if (!start || !end) return false
    return start.y * 12 + start.m <= target && target <= end.y * 12 + end.m
  })
}

export function latestReadMonth(items: ShelfBook[]): { y: number; m: number } | null {
  const [latest] = sortShelf(items, 'recent')
  const date =
    parseReadDate(latest?.book?.readTo) ?? parseReadDate(latest?.book?.readFrom)
  return date ? { y: date.y, m: date.m } : null
}
