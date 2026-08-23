import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { adminListPosts, createPost } from '../server/posts'
import { formatDate } from '../lib/date'

export const Route = createFileRoute('/write/')({
  loader: () => adminListPosts(),
  component: WriteIndex,
})

function WriteIndex() {
  const posts = Route.useLoaderData()
  const router = useRouter()

  async function onNewPost() {
    const id = await createPost()
    await router.navigate({ to: '/write/$id', params: { id } })
  }

  return (
    <div className="write-index">
      <div className="write-index-header">
        <h1>글 관리</h1>
        <button type="button" className="primary" onClick={onNewPost}>
          새 글
        </button>
      </div>
      {posts.length === 0 ? (
        <div className="empty">
          <p>첫 글을 써 보자.</p>
        </div>
      ) : (
        <ul className="post-list admin">
          {posts.map((post) => (
            <li key={post.id}>
              <Link to="/write/$id" params={{ id: post.id }}>
                <h2>{post.title || '(제목 없음)'}</h2>
                <span
                  className="badge"
                  data-status={post.status}
                >
                  {post.status === 'published' ? '발행됨' : '초안'}
                </span>
                <time dateTime={post.updated_at}>
                  {formatDate(post.updated_at)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
