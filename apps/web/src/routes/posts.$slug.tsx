import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'
import { getPublishedPost, listPublishedPosts } from '../server/posts'
import type { Book } from '../server/posts'
import { BookCover, StarRating } from '../components/book'
import { Comments } from '../components/comments'
import { ChevronIcon } from '../svgs'
import { formatDate } from '../lib/date'

export const Route = createFileRoute('/posts/$slug')({
  loader: async ({ params }) => {
    const [post, list] = await Promise.all([
      getPublishedPost({ data: params.slug }),
      listPublishedPosts(),
    ])
    return { post, list }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.post.title ?? '글'} · 양수빈 블로그` }],
  }),
  component: PostPage,
})

function PostPage() {
  const { post, list } = Route.useLoaderData()
  const articleRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const idx = list.findIndex((p) => p.slug === post.slug)
  const next = idx > 0 ? list[idx - 1] : null
  const prev = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null

  const shelf = useMemo(
    () => list.filter((p) => p.book && p.slug !== post.slug).slice(0, 4),
    [list, post.slug],
  )

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

      {(prev || next) && (
        <nav className="post-nav">
          {prev ? (
            <Link to="/posts/$slug" params={{ slug: prev.slug! }}>
              <span className="dir">
                <ChevronIcon dir="left" />
                이전 글
              </span>
              <span className="nav-title">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to="/posts/$slug"
              params={{ slug: next.slug! }}
              className="next"
            >
              <span className="dir">
                다음 글
                <ChevronIcon dir="right" />
              </span>
              <span className="nav-title">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
      <Comments />
    </article>
  )
}

function BookInfo({ id, book }: { id: number; book: Book }) {
  const period = [book.readFrom, book.readTo].filter(Boolean).join(' ~ ')
  return (
    <section className="book-info">
      <div className="book-tile">
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
        {book.oneLiner && <p className="book-oneliner">{book.oneLiner}</p>}
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
      <h2 className="review-section">마음을 이끈 문장들</h2>
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
            <span className="toc-marker" aria-hidden="true" />
            <div className="toc-body">
              <span className="toc-title">{entry.title}</span>
              {entry.note && <span className="toc-note">{entry.note}</span>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
