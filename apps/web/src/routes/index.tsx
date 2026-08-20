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
      aria-label="small currents shape the shore — slowly, surely."
    >
      <h1 className="hero-comp" aria-hidden>
        <span className="hc-row">
          <span className="t-90">Small</span>
          <img className="hc-figure" src="/hero/figure.png" alt="" />
          <span className="t-100">Currents</span>
        </span>
        <span className="hc-row">
          <span className="t-90 hc-arrow">→</span>
          <span className="t-90">Shape</span>
          <img className="water-strip" src="/hero/sea.jpg" alt="" />
          <span className="t-100">The Shore</span>
        </span>
        <span className="hc-row">
          <span className="t-90">Slowly,</span>
          <span className="mac-pill">
            <img src="/hero/mac.png" alt="" />
          </span>
          <span className="t-100">Surely.</span>
        </span>
      </h1>
    </section>
  )
}

export function formatDate(sqlite: string): string {
  const d = new Date(sqlite.replace(' ', 'T') + 'Z')
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
