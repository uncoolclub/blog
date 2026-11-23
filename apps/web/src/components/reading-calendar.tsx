import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { CoverImage, StarGlyph } from './book'
import { ChevronIcon } from '../svgs'
import {
  booksInMonth,
  buildReadingDays,
  dayKey,
  monthKey,
  sortShelf,
} from '../lib/reading'
import type { CalendarDay, ShelfBook } from '../lib/reading'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = Array.from({ length: 12 }, (_, i) => i)
const BOOKS_PER_PAGE = 5

export type CalendarScale = 'month' | 'year'

const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
const firstWeekday = (y: number, m: number) => new Date(y, m, 1).getDay()

function useTodayKey() {
  const [today, setToday] = useState<string>()
  useEffect(() => {
    const now = new Date()
    setToday(dayKey(now.getFullYear(), now.getMonth(), now.getDate()))
  }, [])
  return today
}

function shortPeriod(from?: string, to?: string) {
  if (!from || !to) return from || to || ''
  return `${from} ~ ${from.slice(0, 5) === to.slice(0, 5) ? to.slice(5) : to}`
}

function CalendarBooks({
  title,
  readDays,
  books,
}: {
  title: string
  readDays: number
  books: ShelfBook[]
}) {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(books.length / BOOKS_PER_PAGE))
  const current = Math.min(page, pages - 1)
  const visible = books.slice(
    current * BOOKS_PER_PAGE,
    (current + 1) * BOOKS_PER_PAGE,
  )

  return (
    <div className="reading-side">
      <div className="reading-side-head">
        <h3>
          {title} <b>{books.length}권</b>
        </h3>
        <span>읽은 날 {readDays}일</span>
      </div>
      {books.length === 0 ? (
        <p className="reading-empty">기록이 없어요.</p>
      ) : (
        <ul className="reading-books" data-paged={pages > 1 || undefined}>
          {visible.map((item) => {
            const book = item.book!
            const cover = book.coverFallbackUrl ?? book.coverUrl
            const period = shortPeriod(book.readFrom, book.readTo)
            return (
              <li key={item.id}>
                <Link to="/posts/$slug" params={{ slug: item.slug! }}>
                  {cover ? (
                    <CoverImage
                      className="reading-cover"
                      src={cover}
                      fallback={book.coverUrl}
                      loading="lazy"
                    />
                  ) : (
                    <span className="reading-cover" aria-hidden="true" />
                  )}
                  <span className="reading-book-text">
                    <span className="reading-book-title">{item.title}</span>
                    <span className="reading-book-meta">
                      {book.rating != null && (
                        <span className="reading-book-rating">
                          <StarGlyph />
                          {book.rating.toFixed(1)}
                        </span>
                      )}
                      {book.rating != null && period && (
                        <span aria-hidden="true">·</span>
                      )}
                      {period && <span>{period}</span>}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {pages > 1 && (
        <div className="quote-controls reading-pager">
          <span aria-live="polite">
            {current + 1} / {pages}
          </span>
          <button
            type="button"
            aria-label="이전 책 목록"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            <ChevronIcon dir="left" />
          </button>
          <button
            type="button"
            aria-label="다음 책 목록"
            disabled={current === pages - 1}
            onClick={() => setPage(current + 1)}
          >
            <ChevronIcon dir="right" />
          </button>
        </div>
      )}
    </div>
  )
}

function MonthCalendar({
  y,
  m,
  days,
  items,
}: {
  y: number
  m: number
  days: Map<string, CalendarDay>
  items: ShelfBook[]
}) {
  const today = useTodayKey()
  const [selected, setSelected] = useState<string>()
  const total = daysIn(y, m)
  const readCount = Array.from({ length: total }, (_, i) =>
    dayKey(y, m, i + 1),
  ).filter((key) => days.has(key)).length
  const selectedDay = selected ? days.get(selected) : undefined
  const books = sortShelf(selectedDay?.books ?? booksInMonth(items, y, m), 'recent')

  return (
    <div className="reading-body">
      <div className="reading-main">
        <div className="reading-grid" aria-hidden="true">
          {WEEKDAYS.map((day) => (
            <span key={day} className="reading-weekday">
              {day}
            </span>
          ))}
        </div>
        <div className="reading-grid">
          {Array.from({ length: firstWeekday(y, m) }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: total }, (_, i) => {
            const d = i + 1
            const key = dayKey(y, m, d)
            const day = days.get(key)
            return (
              <button
                key={key}
                type="button"
                className="reading-day"
                disabled={!day}
                data-read={day ? '' : undefined}
                data-finished={day?.finished ? '' : undefined}
                data-today={key === today ? '' : undefined}
                aria-pressed={selected === key}
                aria-label={`${y}년 ${m + 1}월 ${d}일${
                  day ? `, 읽은 책 ${day.books.length}권` : ''
                }`}
                onClick={() =>
                  setSelected((value) => (value === key ? undefined : key))
                }
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>
      <CalendarBooks
        key={selected ?? 'month'}
        title={
          selected
            ? `${m + 1}월 ${Number(selected.slice(8))}일의 책`
            : `${m + 1}월의 책`
        }
        readDays={readCount}
        books={books}
      />
    </div>
  )
}

function YearCalendar({
  y,
  days,
  items,
  onMonth,
}: {
  y: number
  days: Map<string, CalendarDay>
  items: ShelfBook[]
  onMonth: (m: number) => void
}) {
  const yearKey = `${y}-`
  const readDays = [...days.keys()].filter((k) => k.startsWith(yearKey)).length
  const books = useMemo(
    () =>
      sortShelf(
        items.filter((item) =>
          MONTHS.some((m) => booksInMonth([item], y, m).length > 0),
        ),
        'recent',
      ),
    [items, y],
  )

  return (
    <div className="reading-body">
      <div className="reading-year">
        {MONTHS.map((m) => (
          <button
            key={monthKey(y, m)}
            type="button"
            className="reading-mini"
            aria-label={`${y}년 ${m + 1}월 보기`}
            onClick={() => onMonth(m)}
          >
            <span>{m + 1}월</span>
            <span className="reading-mini-grid" aria-hidden="true">
              {Array.from({ length: firstWeekday(y, m) }, (_, i) => (
                <i key={`blank-${i}`} data-blank="" />
              ))}
              {Array.from({ length: daysIn(y, m) }, (_, i) => {
                const day = days.get(dayKey(y, m, i + 1))
                return (
                  <i
                    key={i}
                    data-read={day ? '' : undefined}
                    data-finished={day?.finished ? '' : undefined}
                  />
                )
              })}
            </span>
          </button>
        ))}
      </div>
      <CalendarBooks
        key={y}
        title={`${y}년의 책`}
        readDays={readDays}
        books={books}
      />
    </div>
  )
}

export function ReadingCalendar({
  items,
  scale,
  y,
  m,
  onChange,
}: {
  items: ShelfBook[]
  scale: CalendarScale
  y: number
  m: number
  onChange: (next: { scale: CalendarScale; y: number; m: number }) => void
}) {
  const days = useMemo(() => buildReadingDays(items), [items])

  const shift = (delta: number) => {
    if (scale === 'year') {
      onChange({ scale, y: y + delta, m })
      return
    }
    const next = new Date(y, m + delta, 1)
    onChange({ scale, y: next.getFullYear(), m: next.getMonth() })
  }

  return (
    <div className="reading-calendar">
      <div className="reading-head">
        <div className="reading-nav">
          <button
            type="button"
            aria-label={scale === 'year' ? '이전 해' : '이전 달'}
            onClick={() => shift(-1)}
          >
            <ChevronIcon dir="left" />
          </button>
          <h2 aria-live="polite">
            {scale === 'year' ? `${y}년` : `${y}년 ${m + 1}월`}
          </h2>
          <button
            type="button"
            aria-label={scale === 'year' ? '다음 해' : '다음 달'}
            onClick={() => shift(1)}
          >
            <ChevronIcon dir="right" />
          </button>
        </div>
        <div className="books-sort" role="group" aria-label="캘린더 범위">
          {(['month', 'year'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={scale === value}
              onClick={() => onChange({ scale: value, y, m })}
            >
              {value === 'month' ? '월간' : '연간'}
            </button>
          ))}
        </div>
      </div>
      {scale === 'month' ? (
        <MonthCalendar key={monthKey(y, m)} y={y} m={m} days={days} items={items} />
      ) : (
        <YearCalendar
          y={y}
          days={days}
          items={items}
          onMonth={(month) => onChange({ scale: 'month', y, m: month })}
        />
      )}
    </div>
  )
}
