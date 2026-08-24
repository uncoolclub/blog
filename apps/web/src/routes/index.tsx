import { Link, createFileRoute } from '@tanstack/react-router'
import { BookCover, StarGlyph } from '../components/book'
import { Cover } from '../components/cover'
import { ChevronIcon } from '../svgs'
import { formatDate } from '../lib/date'
import { listPublishedPosts } from '../server/posts'

export const Route = createFileRoute('/')({
  loader: () => listPublishedPosts(),
  component: Home,
})

function Home() {
  const posts = Route.useLoaderData()
  // 서평은 아래 책장 섹션이 표지 격자로 따로 보여 준다. 글 리스트에는 섞지 않는다.
  const shelf = posts.filter((p) => p.book)
  const articles = posts.filter((p) => !p.book)
  const [featured, ...others] = articles
  const cards = others.slice(0, 2)
  const rest = others.slice(2)

  if (posts.length === 0) {
    return (
      <div className="empty">
        <p>아직 글이 없어요.</p>
      </div>
    )
  }

  return (
    <>
      {featured && (
        <Link
          to="/posts/$slug"
          params={{ slug: featured.slug! }}
          className="featured"
        >
          <Cover id={featured.id} image={featured.cover} large />
          <div className="card-body">
            <span className="card-title">{featured.title}</span>
            {featured.excerpt && (
              <p className="card-excerpt">{featured.excerpt}</p>
            )}
            {featured.published_at && (
              <time className="card-date" dateTime={featured.published_at}>
                {formatDate(featured.published_at)}
              </time>
            )}
          </div>
        </Link>
      )}

      {cards.length > 0 && (
        <div className="card-grid">
          {cards.map((post) => (
            <Link
              key={post.id}
              to="/posts/$slug"
              params={{ slug: post.slug! }}
              className="post-card"
            >
              <Cover id={post.id} image={post.cover} />
              <div className="card-body">
                <span className="card-title">{post.title}</span>
                {post.excerpt && (
                  <p className="card-excerpt">{post.excerpt}</p>
                )}
                {post.published_at && (
                  <time className="card-date" dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="row-list">
          <span className="year">
            {rest[0].published_at?.slice(0, 4) ?? ''}
          </span>
          {rest.map((post) => (
            <Link
              key={post.id}
              to="/posts/$slug"
              params={{ slug: post.slug! }}
            >
              <span className="row-title">{post.title}</span>
              <span className="spacer" />
              {post.published_at && (
                <time className="row-date" dateTime={post.published_at}>
                  {formatDate(post.published_at).slice(5)}
                </time>
              )}
            </Link>
          ))}
        </div>
      )}

      {shelf.length > 0 && (
        <section className="shelf">
          <div className="shelf-head">
            <span className="year">책장</span>
            <span className="see-all">
              전체 보기
              <ChevronIcon dir="right" />
            </span>
          </div>
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
      )}
    </>
  )
}
