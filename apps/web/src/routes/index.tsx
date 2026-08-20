import { Link, createFileRoute } from '@tanstack/react-router'
import { listPublishedPosts } from '../server/posts'

export const Route = createFileRoute('/')({
  loader: () => listPublishedPosts(),
  component: Home,
})

function Home() {
  const posts = Route.useLoaderData()

  return (
    <>
      <Hero />
      <div className="index-head">
        <span>Index</span>
        <span>({String(posts.length).padStart(2, '0')})</span>
      </div>
      {posts.length === 0 ? (
        <div className="empty">
          <p>No posts yet.</p>
        </div>
      ) : (
        <ul className="post-list">
          {posts.map((post, i) => (
            <li key={post.id}>
              <Link to="/posts/$slug" params={{ slug: post.slug! }}>
                <div className="entry-meta">
                  <span className="post-no">
                    {String(posts.length - i).padStart(2, '0')}
                  </span>
                  {post.published_at && (
                    <time dateTime={post.published_at}>
                      {formatDate(post.published_at)}
                    </time>
                  )}
                </div>
                <h2>{post.title || '(제목 없음)'}</h2>
                {post.excerpt && <p className="excerpt">{post.excerpt}</p>}
                <span className="read-more">Read →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

// 대형 타이포 사이에 이미지 칩이 끼어드는 배너.
// "WRITE WITHOUT 'BUILDS' IS JUST 'LIVE'"
function Hero() {
  return (
    <section className="hero" aria-label="Write without builds is just live">
      <h1 className="hero-lines" aria-hidden>
        <span className="hl">
          Write
          <img className="chip" src="/hero/a.jpg" alt="" />
        </span>
        <span className="hl">
          <Star />
          Without
        </span>
        <span className="hl">
          ‘Builds’
          <span className="chip chip--blue" />
          is
        </span>
        <span className="hl">
          Just
          <img className="chip" src="/hero/c.jpg" alt="" />
          ‘Live’
        </span>
      </h1>
      <div className="hero-foot">
        <div className="pill-row">
          <span className="pill">Frontend</span>
          <span className="pill">Design System</span>
          <span className="pill">React Native</span>
        </div>
        <div className="hero-line--sub">
          <span>Seoul</span>
          <Wave />
          <span>Based</span>
        </div>
        <div className="hero-meta">
          <span>KR ● 37.5665, 126.9780</span>
          <span>Personal dev blog</span>
        </div>
      </div>
    </section>
  )
}

function Star() {
  const spikes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6
    const b = a + Math.PI / 12
    const c = a + Math.PI / 6
    return `L${50 + 48 * Math.cos(a)} ${50 + 48 * Math.sin(a)} L${
      50 + 16 * Math.cos(b)
    } ${50 + 16 * Math.sin(b)} L${50 + 48 * Math.cos(c)} ${50 + 48 * Math.sin(c)}`
  }).join(' ')
  return (
    <svg className="hero-star" viewBox="0 0 100 100" aria-hidden>
      <path d={`M${50 + 48} 50 ${spikes} Z`} fill="currentColor" />
    </svg>
  )
}

function Wave() {
  return (
    <svg className="hero-wave" viewBox="0 0 200 14" preserveAspectRatio="none">
      <path
        d="M0 7 Q 12.5 0 25 7 T 50 7 T 75 7 T 100 7 T 125 7 T 150 7 T 175 7 T 200 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

export function formatDate(sqlite: string): string {
  const d = new Date(sqlite.replace(' ', 'T') + 'Z')
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
