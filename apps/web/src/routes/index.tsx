import { Link, createFileRoute } from '@tanstack/react-router'
import { listPublishedPosts } from '../server/posts'

export const Route = createFileRoute('/')({
  loader: () => listPublishedPosts(),
  component: Home,
})

// 글 id 기반으로 카드 배경 톤 자동 배정
const CARD_TONES = ['blue', 'ink', 'cream'] as const

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
        <ul className="post-grid">
          {posts.map((post, i) => (
            <li key={post.id}>
              <Link
                to="/posts/$slug"
                params={{ slug: post.slug! }}
                className={`card card--${CARD_TONES[(post.id - 1) % CARD_TONES.length]}`}
              >
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
      aria-label="small currents shape the shore — 양수빈, seoul"
    >
      <h1 className="hero-comp" aria-hidden>
        <span className="hc-row hc-row--small">
          <span className="t-small">small</span>
        </span>
        <span className="hc-row hc-row--currents">
          <img className="hc-figure" src="/hero/figure.png" alt="" />
          <span className="capsule">Currents</span>
          <HeroWave />
        </span>
        <span className="hc-row hc-row--shape">
          <span className="t-shape">Shape</span>
          <span className="mac-pill">
            <img src="/hero/mac.png" alt="" />
          </span>
          <span className="t-the">The</span>
        </span>
        <span className="hc-row hc-row--water">
          <img className="water-capsule" src="/hero/sea.jpg" alt="" />
        </span>
        <span className="hc-row hc-row--shore">
          <span className="t-shore">
            <i className="q">‘</i>Shore.<i className="q">’</i>
          </span>
        </span>
      </h1>
    </section>
  )
}

// CURRENTS 뒤로 흐르는 붓질 물결 (두껍고 불규칙한 컷아웃 스트로크)
function HeroWave() {
  return (
    <svg
      className="hc-wave"
      viewBox="0 0 220 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M8 26 C16 6 30 4 40 18 C48 30 58 36 68 26 C78 16 84 6 96 12 C108 18 112 34 126 26 C138 19 142 6 154 12 C166 18 170 32 184 24 C194 18 202 10 212 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="17"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function formatDate(sqlite: string): string {
  const d = new Date(sqlite.replace(' ', 'T') + 'Z')
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
