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
      aria-label="small currents shape the shore — 양수빈, seoul"
    >
      <h1 className="hero-lines" aria-hidden>
        <span className="hl">
          <span>Small</span>
          <span className="chip chip--fill chip--block" />
        </span>
        <span className="hl">
          <Dancers />
          <span>Currents</span>
          <HeroWave />
        </span>
        <span className="hl">
          <span>Shape</span>
          <img className="chip chip--cut" src="/hero/mac.png" alt="" />
          <span>the</span>
          <img
            className="chip chip--fill chip--pool"
            src="/hero/pool.jpg"
            alt=""
          />
        </span>
        <span className="hl">
          <span className="oq">‘Shore.’</span>
          <img
            className="chip chip--fill chip--shore"
            src="/hero/shore.jpg"
            alt=""
          />
        </span>
      </h1>
    </section>
  )
}

// 미로풍 뒤집힌 사람(물구나무 스웨그): 두꺼운 곡선 두 덩어리 + 잉크 아웃라인
function Dancers() {
  const pieces = [
    // 위: 차올려 뒤집힌 다리 아치 (기울어짐)
    'M52 88 C54 38 112 22 136 52 C147 66 148 80 140 92',
    // 아래: 바닥을 짚은 몸통 훅 (더 묵직하게)
    'M16 148 C26 114 62 100 98 110 C126 118 144 138 134 166',
  ]
  return (
    <svg className="chip chip--blob" viewBox="0 0 170 190" aria-hidden>
      {pieces.map((d) => (
        <g key={d} fill="none" strokeLinecap="round">
          <path d={d} stroke="var(--text)" strokeWidth="46" />
          <path d={d} stroke="currentColor" strokeWidth="37" />
        </g>
      ))}
    </svg>
  )
}

// CURRENTS 뒤로 흐르는 붓질 물결 (두껍고 불규칙한 컷아웃 스트로크)
function HeroWave() {
  return (
    <svg
      className="hl-squiggle"
      viewBox="0 0 220 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M6 24 C14 6 28 4 38 18 C46 30 56 36 66 26 C76 16 82 6 94 12 C106 18 110 34 124 26 C136 19 140 6 152 12 C164 18 168 32 182 24 C192 18 200 10 214 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
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
