import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { Book, BookSummary, PostDetail } from '../server/posts'
import { BookCover, StarRating } from '../components/book'
import { ChevronIcon } from '../svgs'
import { formatDate } from '../lib/date'

export interface ShelfItem {
  id: number
  slug: string | null
  book: BookSummary | null
}

/** 상세와 미리보기가 공유하는 읽기 화면. 이전·다음 내비와 댓글은 호출부가 붙인다. */
export function PostView({
  post,
  shelf,
  banner,
  children,
}: {
  post: PostDetail
  shelf: ShelfItem[]
  banner?: ReactNode
  children?: ReactNode
}) {
  const articleRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const words = useMemo(
    () =>
      post.html
        .replace(/<[^>]*>/g, ' ')
        .trim()
        .split(/\s+/).length,
    [post.html],
  )

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
      {banner}
      <header className="post-header">
        {post.book && <span className="post-label">BOOKSHELF</span>}
        <h1>{post.title}</h1>
        <p className="post-meta">
          {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'} · {words}{' '}
          words
        </p>
      </header>

      {post.book ? (
        <>
          <BookInfo id={post.id} book={post.book} />
          <Quotes book={post.book} />
          <Toc book={post.book} />
          <section className="review-body">
            <h2 className="review-section">서평</h2>
            {prose}
          </section>
          {shelf.length > 0 && (
            <section className="read-books">
              <div className="review-section-head">
                <h2 className="review-section">읽었던 책</h2>
                <span className="see-all">
                  전체 보기
                  <ChevronIcon dir="right" />
                </span>
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

function BookInfo({ id, book }: { id: number; book: Book }) {
  const period = [book.readFrom, book.readTo].filter(Boolean).join(' ~ ')
  return (
    <section className="book-info">
      <div
        className="book-tile"
        data-cover-color={book.coverColor ? '' : undefined}
        style={
          book.coverColor
            ? ({ '--cover-color': book.coverColor } as CSSProperties)
            : undefined
        }
      >
        <BookCover id={id} book={book} />
      </div>
      <div className="book-meta">
        {(book.readTo || period) && (
          <div className="book-chips">
            {book.readTo && (
              <span className="chip done">
                <svg viewBox="0 0 16 16">
                  <path d="m2.5 8.5 3.5 3.5 7.5-8" />
                </svg>
                완독
              </span>
            )}
            {period && <span className="chip">{period}</span>}
          </div>
        )}
        <span className="book-title">{book.title}</span>
        {book.rating != null && <StarRating rating={book.rating} />}
        <dl className="book-fields">
          <Field label="지은이" value={book.author} />
          <Field label="옮긴이" value={book.translator} />
          <Field label="출판사" value={book.publisher} />
        </dl>
        {book.oneLiner && <p className="book-oneliner">{book.oneLiner}</p>}
      </div>
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
      <div className="quote-rail">
        {book.quotes.map((quote, i) => (
          <figure key={i} className="quote-card">
            <span className="quote-mark" aria-hidden="true">
              &#8220;
            </span>
            <blockquote>{quote.text}</blockquote>
            <figcaption>
              <span className="quote-book">{book.title}</span>
              {quote.page && <span className="quote-page">P.{quote.page}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Toc({ book }: { book: Book }) {
  if (book.toc.length === 0) return null
  return (
    <section className="book-toc">
      <h2 className="review-section">목차</h2>
      <ol>
        {book.toc.map((entry, i) => (
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
    </section>
  )
}
