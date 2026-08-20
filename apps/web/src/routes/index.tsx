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

// 정체성 배너: 문장은 내 것, 칩은 내 도메인의 오브젝트(토큰 스와치•UI 프레임•커서).
// "marry yang turns design into code — and writes it here"
function Hero() {
  return (
    <section
      className="hero"
      aria-label="marry yang turns design into code — and writes it here"
    >
      <h1 className="hero-lines" aria-hidden>
        <span className="hl">marry yang</span>
        <span className="hl">
          turns
          <TokenChip />
          design
        </span>
        <span className="hl">
          into
          <FrameChip />
          code,
        </span>
        <span className="hl">
          writes it here
          <Caret />
        </span>
      </h1>
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

// 디자인 토큰 스와치: 팔레트 견본 조각
function TokenChip() {
  return (
    <span className="chip chip--tokens">
      <i style={{ background: 'var(--accent)' }} />
      <i style={{ background: '#17a24a' }} />
      <i style={{ background: '#ffb200' }} />
      <i style={{ background: '#ff4f30' }} />
    </span>
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

// 글 쓰는 중인 커서
function Caret() {
  return <span className="chip chip--caret" />
}

export function formatDate(sqlite: string): string {
  const d = new Date(sqlite.replace(' ', 'T') + 'Z')
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
