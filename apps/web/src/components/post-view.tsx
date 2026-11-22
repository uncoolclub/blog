import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Book, BookSummary, PostDetail } from '../server/posts'
import { BookCover, StarRating } from '../components/book'
import { ChevronIcon } from '../svgs'
import { formatDate } from '../lib/date'

export interface ShelfItem {
  id: number
  slug: string | null
  book: BookSummary | null
}

export function PostView({
  post,
  shelf,
  preview = false,
  children,
}: {
  post: PostDetail
  shelf: ShelfItem[]
  preview?: boolean
  children?: ReactNode
}) {
  const articleRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const text = useMemo(
    () => post.html.replace(/<[^>]*>/g, ' ').trim(),
    [post.html],
  )
  const words = text ? text.split(/\s+/).length : 0
  const hasBody = Boolean(text) || /<(?:img|iframe|hr|video)\b/i.test(post.html)
  const label = post.book
    ? preview
      ? '책장 • 미리보기'
      : '책장'
    : preview
      ? '미리보기'
      : null
  const meta = [
    post.publishedAt ? formatDate(post.publishedAt) : null,
    !post.book && words > 0 ? `${words} words` : null,
  ].filter(Boolean)

  useEffect(() => {
    if (!articleRef.current?.querySelector('pre > code, .embed-youtube')) return
    void import('@blog/editor/highlight').then(({ enhancePost }) => {
      if (articleRef.current) enhancePost(articleRef.current)
    })
  }, [post.id])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max ? el.scrollTop / max : 0})`
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [post.id])

  const prose = (
    <div
      ref={articleRef}
      className="prose"
      dangerouslySetInnerHTML={{ __html: post.html }}
    />
  )

  return (
    <article className="post">
      <div className="post-progress" ref={progressRef} aria-hidden="true" />
      <header className="post-header">
        {label && <span className="post-label">{label}</span>}
        <h1 data-empty={(preview && !post.title) || undefined}>
          {post.title || (preview ? '제목 없음' : '')}
        </h1>
        {meta.length > 0 && <p className="post-meta">{meta.join(' · ')}</p>}
      </header>

      {post.book ? (
        <>
          <BookInfo id={post.id} book={post.book} />
          <Quotes book={post.book} />
          <Toc book={post.book} />
          {hasBody && (
            <section className="review-body">
              <h2 className="review-section">읽고 나서</h2>
              {prose}
            </section>
          )}
          {shelf.length > 0 && (
            <section className="read-books">
              <div className="review-section-head">
                <h2 className="review-section">읽었던 책</h2>
                <Link to="/books" className="see-all">
                  전체 보기
                  <ChevronIcon dir="right" />
                </Link>
              </div>
              <div className="book-grid">
                {shelf.map((p) => (
                  <Link
                    key={p.id}
                    to="/posts/$slug"
                    params={{ slug: p.slug! }}
                    className="book-mini"
                  >
                    <BookCover id={p.id} book={p.book!} />
                    <div className="book-mini-body">
                      <span className="book-mini-title">{p.book!.title}</span>
                      <span className="book-mini-author">{p.book!.author}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        prose
      )}

      {children}
    </article>
  )
}

function readingPeriod(from?: string, to?: string) {
  if (!from || !to) return from || to || ''
  const sameYear = from.slice(0, 5) === to.slice(0, 5)
  return `${from} ~ ${sameYear ? to.slice(5) : to}`
}

function BookInfo({ id, book }: { id: number; book: Book }) {
  const period = readingPeriod(book.readFrom, book.readTo)
  return (
    <section className="book-info">
      <div className="book-info-cover">
        <BookCover id={id} book={book} />
      </div>
      <div className="book-meta">
        <span className="book-title">{book.title}</span>
        {book.rating != null && <StarRating rating={book.rating} />}
        <dl className="book-fields">
          <Field label="지은이" value={book.author} />
          <Field label="옮긴이" value={book.translator} />
          <Field label="출판사" value={book.publisher} />
        </dl>
        {period && (
          <p className="book-reading">
            {book.readTo && <span>완독</span>}
            {period}
          </p>
        )}
      </div>
      {book.oneLiner && <p className="book-oneliner">{book.oneLiner}</p>}
    </section>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Quotes({ book }: { book: Book }) {
  if (book.quotes.length === 0) return null
  return (
    <section className="quotes">
      <h2 className="review-section">문장 수집</h2>
      <div className="quote-list">
        {book.quotes.map((quote, i) => (
          <figure key={i} className="quote-item">
            <blockquote>{quote.text}</blockquote>
            {quote.page?.trim() && (
              <figcaption>
                {/^\d+$/.test(quote.page.trim())
                  ? `${quote.page.trim()}쪽`
                  : quote.page.trim()}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  )
}

const TOC_PREVIEW = 8

function Toc({ book }: { book: Book }) {
  const [expanded, setExpanded] = useState(false)
  if (book.toc.length === 0) return null
  const collapsible = book.toc.length > TOC_PREVIEW
  const entries =
    collapsible && !expanded ? book.toc.slice(0, TOC_PREVIEW) : book.toc
  const hasSource = Number.isSafeInteger(book.yes24ItemId)
  return (
    <section className="book-toc">
      <h2 className="review-section">목차</h2>
      <ol>
        {entries.map((entry, i) => (
          <li key={i}>
            <span className="toc-num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="toc-title">{entry.title}</span>
            {entry.note && (
              <>
                <span className="toc-leader" aria-hidden="true" />
                <span className="toc-note">{entry.note}</span>
              </>
            )}
          </li>
        ))}
      </ol>
      {(collapsible || hasSource) && (
        <div className="toc-foot">
          {collapsible && (
            <button
              type="button"
              className="toc-toggle"
              aria-expanded={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? '접기' : `전체 보기 (${book.toc.length})`}
            </button>
          )}
          {hasSource && (
            <a
              className="toc-source"
              href={`https://www.yes24.com/product/goods/${book.yes24ItemId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              출처: 예스24
            </a>
          )}
        </div>
      )}
    </section>
  )
}
