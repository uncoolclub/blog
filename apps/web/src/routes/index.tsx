import { Link, createFileRoute } from '@tanstack/react-router'
import { Cover } from '../components/cover'
import { formatDate } from '../lib/date'
import { listPublishedPosts } from '../server/posts'

export const Route = createFileRoute('/')({
  loader: () => listPublishedPosts(),
  component: Home,
})

function Home() {
  const posts = Route.useLoaderData()
  const [featured, ...others] = posts
  const cards = others.slice(0, 2)
  const rest = others.slice(2)

  if (!featured) {
    return (
      <div className="empty">
        <p>아직 글이 없어요.</p>
      </div>
    )
  }

  return (
    <>
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
    </>
  )
}
