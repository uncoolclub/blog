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
          Screens
          <span className="obj">
            <img className="chip chip--mac" src="/hero/mac.png" alt="" />
            <sup>1)</sup>
          </span>
        </span>
        <span className="hl hl--alt">
          Systems
          <span className="obj">
            <FrameChip />
            <sup>2)</sup>
          </span>
        </span>
        <span className="hl">
          <span className="amp">&amp;</span>
          Sentences
          <span className="obj">
            <img className="chip chip--type" src="/hero/typewriter.jpg" alt="" />
            <sup>3)</sup>
          </span>
        </span>
        <span className="hl hl--alt hl--sig">
          양수빈
          <Star />
          Seoul
        </span>
      </h1>
      <div className="hero-pencil" aria-hidden>
        <img src="/hero/pencil.jpg" alt="" />
        <sup>4)</sup>
      </div>
      <p className="hero-legend" aria-hidden>
        1) macintosh 128k, 1984 · 2) a screen · 3) silver-reed sr200 · 4)
        연필, hb
      </p>
      <div className="hero-foot">
        <div className="pill-row">
          <span className="pill">frontend</span>
          <span className="pill">design system</span>
          <span className="pill">react native</span>
        </div>
        <div className="hero-meta">
          <span>양수빈 · frontend / ux engineer</span>
          <span>seoul kr ● 37.5665, 126.9780</span>
        </div>
      </div>
    </section>
  )
}

// 미니 브라우저 와이어프레임
function FrameChip() {
  return (
    <svg className="chip chip--frame" viewBox="0 0 76 40" aria-hidden>
      <rect
        x="1"
        y="1"
        width="74"
        height="38"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line x1="1" y1="11" x2="75" y2="11" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="6.5" r="1.6" fill="currentColor" />
      <circle cx="14" cy="6.5" r="1.6" fill="currentColor" />
      <rect x="8" y="17" width="26" height="5" rx="2.5" fill="currentColor" />
      <rect x="8" y="27" width="42" height="5" rx="2.5" fill="var(--accent)" />
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
