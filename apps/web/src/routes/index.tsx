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
          <img
            className="chip chip--fill chip--glitter"
            src="/hero/glitter.jpg"
            alt=""
          />
        </span>
        <span className="hl">
          <Star />
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

function Squiggle({ className = 'squiggle' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 16" preserveAspectRatio="none">
      <path
        d="M0 8 Q 12.5 0 25 8 T 50 8 T 75 8 T 100 8 T 125 8 T 150 8 T 175 8 T 200 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  )
}

// 8잎 데이지 애스터리스크
function Star() {
  return (
    <svg className="chip chip--star" viewBox="0 0 100 100" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="24"
          rx="11.5"
          ry="24"
          fill="currentColor"
          transform={`rotate(${i * 45} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="9" fill="var(--bg)" />
    </svg>
  )
}

// CURRENTS 뒤로 흐르며 옅어지는 물결
function HeroWave() {
  return (
    <svg
      className="hl-squiggle"
      viewBox="0 0 200 20"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-wave-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <path
        d="M0 10 Q 12.5 1 25 10 T 50 10 T 75 10 T 100 10 T 125 10 T 150 10 T 175 10 T 200 10"
        fill="none"
        stroke="url(#hero-wave-fade)"
        strokeWidth="4.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function formatDate(sqlite: string): string {
  const d = new Date(sqlite.replace(' ', 'T') + 'Z')
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
