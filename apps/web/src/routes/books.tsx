import { Link, createFileRoute } from '@tanstack/react-router'
import { BookCover, StarGlyph } from '../components/book'
import { formatDate } from '../lib/date'
import { listPublishedPosts } from '../server/posts'

export const Route = createFileRoute('/books')({
  loader: () => listPublishedPosts(),
  head: () => ({
    meta: [{ title: '책장 · 양수빈 블로그' }],
  }),
  component: BooksPage,
})

function BooksPage() {
  const shelf = Route.useLoaderData().filter((p) => p.book)
  return (
    <section className="books-page">
      <h1 className="books-title">책장</h1>
      <div className="book-grid">
        {shelf.map((post) => (
          <Link
            key={post.id}
            to="/posts/$slug"
            params={{ slug: post.slug! }}
            className="shelf-item"
          >
            <BookCover id={post.id} book={post.book!} showAuthor />
            <div className="shelf-body">
              <span className="shelf-title">{post.title}</span>
              <span className="shelf-meta">
                {post.book!.rating != null && (
                  <>
                    <StarGlyph />
                    <span className="shelf-rating">
                      {post.book!.rating.toFixed(1)}
                    </span>
                  </>
                )}
                {post.book!.rating != null && post.published_at && (
                  <span aria-hidden="true">·</span>
                )}
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at).slice(0, 7)}
                  </time>
                )}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
