import { Link, createFileRoute } from '@tanstack/react-router'
import { listPublishedPosts } from '../server/posts'

export const Route = createFileRoute('/')({
  loader: () => listPublishedPosts(),
  component: Home,
})

function Home() {
  const posts = Route.useLoaderData()

  if (posts.length === 0) {
    return (
      <div className="empty">
        <p>아직 발행된 글이 없어요.</p>
      </div>
    )
  }

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.id}>
          <Link to="/posts/$slug" params={{ slug: post.slug! }}>
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
  )
}

export function formatDate(sqlite: string): string {
  const d = new Date(sqlite.replace(' ', 'T') + 'Z')
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
