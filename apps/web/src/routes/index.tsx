import { Link, createFileRoute } from '@tanstack/react-router'
import { listPublishedPosts } from '../server/posts'
import { WaveGlyph } from '../svgs'

export const Route = createFileRoute('/')({
  loader: () => listPublishedPosts(),
  component: Home,
})

// 커버 이미지 필드가 생기기 전까지, 글 id 기반의 잔잔한 그라디언트 커버
const COVERS = [
  { bg: 'linear-gradient(135deg, #e6ecff 0%, #c9d6ff 100%)', ink: '#1342ff' },
  { bg: 'linear-gradient(135deg, #f1efe9 0%, #e6e2d6 100%)', ink: '#6b6b73' },
  { bg: 'linear-gradient(135deg, #e9f2ec 0%, #d9e8de 100%)', ink: '#4d7a5f' },
] as const

function Cover({ id, large }: { id: number; large?: boolean }) {
  const c = COVERS[id % COVERS.length]
  const size = large ? { width: 96, height: 60 } : { width: 60, height: 38 }
  return (
    <div className="cover" style={{ background: c.bg }} aria-hidden="true">
      <WaveGlyph stroke={c.ink} strokeWidth={7} style={size} />
    </div>
  )
}

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
        <Cover id={featured.id} large />
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
              <Cover id={post.id} />
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

export function formatDate(sqlite: string): string {
  const d = new Date(sqlite.replace(' ', 'T') + 'Z')
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
