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

// 정체성 배너: 견본 시트(specimen sheet) 컨셉.
// 화면을 만들고 문장을 쓰는 사람 — "TOOLS FOR 'SCREENS' & SENTENCES BY 양수빈"
// 오브젝트는 주석 번호를 단 실물(맥 128k·타자기·연필) + 직접 그린 UI 프레임.
function Hero() {
  return (
    <section
      className="hero"
      aria-label="screens, systems and sentences — 양수빈, seoul"
    >
      <h1 className="hero-lines" aria-hidden>
        <span className="hl">
          <span>Screens</span>
          <img
            className="chip chip--fill chip--mac"
            src="/hero/mac.png"
            alt=""
          />
        </span>
        <span className="hl">
          <Star />
          <span>Systems</span>
          <span className="hl-push">&amp;</span>
        </span>
        <span className="hl">
          <span className="oq">‘Sentences’</span>
          <img
            className="chip chip--fill chip--type"
            src="/hero/typewriter.jpg"
            alt=""
          />
          <span>by</span>
        </span>
        <span className="hl">
          <span>양수빈</span>
          <img
            className="chip chip--fill chip--pencil"
            src="/hero/pencil.jpg"
            alt=""
          />
          <span>Seoul</span>
        </span>
      </h1>
      <div className="hero-rows">
        <div className="hero-row hero-row--pills">
          <span className="pill">frontend</span>
          <span className="pill">design system</span>
          <span className="pill">react native</span>
        </div>
        <div className="hero-row hero-row--slogan">
          <span>Write</span>
          <Squiggle />
          <span>Publish</span>
          <Squiggle />
          <span>Live</span>
        </div>
        <div className="hero-row hero-row--meta">
          <span>kr ● seoul, 양수빈</span>
          <span>37.5665, 126.9780</span>
        </div>
      </div>
    </section>
  )
}

function Squiggle() {
  return (
    <svg className="squiggle" viewBox="0 0 200 16" preserveAspectRatio="none">
      <path
        d="M0 8 Q 12.5 0 25 8 T 50 8 T 75 8 T 100 8 T 125 8 T 150 8 T 175 8 T 200 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
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
    <svg className="chip chip--star" viewBox="0 0 100 100" aria-hidden>
      <path d={`M${50 + 48} 50 ${spikes} Z`} fill="currentColor" />
    </svg>
  )
}

export function formatDate(sqlite: string): string {
  const d = new Date(sqlite.replace(' ', 'T') + 'Z')
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
