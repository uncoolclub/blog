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
                <span className="post-no">
                  {String(posts.length - i).padStart(2, '0')}
                </span>
                <h2>{post.title || '(제목 없음)'}</h2>
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Hero() {
  return (
    <section className="hero" aria-label="yang-meli.tech">
      <HeroArt />
      <div className="hero-type">
        <div className="hero-line">
          <span>Write</span>
          <span className="arrow">→</span>
          <span>Publish</span>
          <span className="arrow">→</span>
          <span>Live</span>
        </div>
        <div className="pill-row">
          <span className="pill">Frontend</span>
          <span className="pill">Design System</span>
          <span className="pill">React Native</span>
        </div>
        <div className="hero-line hero-line--sub">
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

function HeroArt() {
  // 도트 사인파 4줄. 참조 무드(할프톤 웨이브)의 최소 구현.
  const waves = [
    { d: 'M-40 96 Q 140 10 320 96 T 680 96 T 1040 96', w: 10, o: 0.9 },
    { d: 'M-40 120 Q 140 40 320 120 T 680 120 T 1040 120', w: 5, o: 0.6 },
    { d: 'M-40 72 Q 140 150 320 72 T 680 72 T 1040 72', w: 3, o: 0.45 },
    { d: 'M-40 140 Q 140 200 320 140 T 680 140 T 1040 140', w: 7, o: 0.3 },
  ]
  return (
    <svg
      className="hero-art"
      viewBox="0 0 1000 210"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-hidden
    >
      <rect width="1000" height="210" fill="#0a0a0a" />
      {waves.map((wave) => (
        <path
          key={wave.d}
          d={wave.d}
          fill="none"
          stroke="#f2f2f0"
          strokeOpacity={wave.o}
          strokeWidth={wave.w}
          strokeLinecap="round"
          strokeDasharray={`0.1 ${wave.w * 2.2}`}
        />
      ))}
      <text
        x="972"
        y="34"
        textAnchor="end"
        fontFamily="SF Mono, Menlo, monospace"
        fontSize="13"
        fill="#f2f2f0"
        fillOpacity="0.7"
      >
        [ yang—meli.tech ]
      </text>
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
