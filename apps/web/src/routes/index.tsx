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

// 미로(Miró)풍 블롭 피규어: 팔 들어올린 유기적 실루엣 + 팔 사이 구멍, 잉크 아웃라인
function Dancers() {
  return (
    <svg className="chip chip--blob" viewBox="0 0 150 190" aria-hidden>
      <path
        fill="currentColor"
        stroke="var(--text)"
        strokeWidth="5"
        strokeLinejoin="round"
        fillRule="evenodd"
        d="M44 46
           C34 28 44 10 58 12
           C68 14 70 26 70 38
           C70 48 68 58 72 64
           C78 58 80 46 82 36
           C86 20 96 6 112 8
           C128 10 130 28 120 42
           C114 52 108 60 106 70
           C114 86 118 104 116 124
           C114 142 118 158 112 172
           C104 184 92 180 92 168
           C92 156 92 146 88 138
           C82 146 80 158 78 168
           C74 180 60 182 56 170
           C52 158 56 144 56 132
           C48 116 44 96 46 78
           C48 64 46 56 44 46 Z"
      />
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
