import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { BookCover, ShelfMeta } from '../components/book'
import { ReadingCalendar } from '../components/reading-calendar'
import { SortMenu } from '../components/sort-menu'
import type { CalendarScale } from '../components/reading-calendar'
import { latestReadMonth, sortShelf } from '../lib/reading'
import type { ShelfSort } from '../lib/reading'
import { listPublishedPosts } from '../server/posts'
import { CalendarIcon, GridIcon } from '../svgs'

interface BooksSearch {
  view?: 'calendar'
  sort?: 'rating' | 'rating-low'
  scale?: 'year'
  period?: string
}

const SORTS: { value: ShelfSort; label: string }[] = [
  { value: 'recent', label: '읽은 순' },
  { value: 'rating-low', label: '별점 낮은 순' },
  { value: 'rating', label: '별점 높은 순' },
]

function parsePeriod(period?: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(period ?? '')
  if (!match) return null
  const m = Number(match[2]) - 1
  return m >= 0 && m <= 11 ? { y: Number(match[1]), m } : null
}

export const Route = createFileRoute('/books')({
  validateSearch: (search: Record<string, unknown>): BooksSearch => ({
    view: search.view === 'calendar' ? 'calendar' : undefined,
    sort:
      search.sort === 'rating' || search.sort === 'rating-low'
        ? search.sort
        : undefined,
    scale: search.scale === 'year' ? 'year' : undefined,
    period: parsePeriod(String(search.period ?? ''))
      ? String(search.period)
      : undefined,
  }),
  loader: () => listPublishedPosts(),
  head: () => ({
    meta: [{ title: '책장 · 양수빈 블로그' }],
  }),
  component: BooksPage,
})

function BooksPage() {
  const posts = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const shelf = useMemo(() => posts.filter((p) => p.book), [posts])
  const sort: ShelfSort = search.sort ?? 'recent'
  const sorted = useMemo(() => sortShelf(shelf, sort), [shelf, sort])
  const scale: CalendarScale = search.scale ?? 'month'
  const fallback = useMemo(() => latestReadMonth(shelf), [shelf])
  const period = parsePeriod(search.period) ??
    fallback ?? { y: new Date().getFullYear(), m: new Date().getMonth() }

  const update = (patch: Partial<BooksSearch>) =>
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
      resetScroll: false,
    })

  return (
    <section className="books-page">
      <div className="books-head">
        <h1 className="books-title">책장</h1>
        <div className="books-views" role="group" aria-label="보기 방식">
          <button
            type="button"
            aria-label="목록"
            title="목록"
            aria-pressed={search.view !== 'calendar'}
            onClick={() => update({ view: undefined })}
          >
            <GridIcon />
          </button>
          <button
            type="button"
            aria-label="캘린더"
            title="캘린더"
            aria-pressed={search.view === 'calendar'}
            onClick={() => update({ view: 'calendar' })}
          >
            <CalendarIcon />
          </button>
        </div>
      </div>

      {search.view === 'calendar' ? (
        <ReadingCalendar
          items={shelf}
          scale={scale}
          y={period.y}
          m={period.m}
          onChange={(next) =>
            update({
              scale: next.scale === 'year' ? 'year' : undefined,
              period: `${next.y}-${String(next.m + 1).padStart(2, '0')}`,
            })
          }
        />
      ) : (
        <>
          <div className="books-toolbar">
            <SortMenu
              options={SORTS}
              value={sort}
              onChange={(value) =>
                update({ sort: value === 'recent' ? undefined : value })
              }
            />
          </div>
          <div className="book-grid">
            {sorted.map((post) => (
              <Link
                key={post.id}
                to="/posts/$slug"
                params={{ slug: post.slug! }}
                className="shelf-item"
              >
                <BookCover id={post.id} book={post.book!} showAuthor />
                <div className="shelf-body">
                  <span className="shelf-title">{post.title}</span>
                  <ShelfMeta book={post.book!} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
