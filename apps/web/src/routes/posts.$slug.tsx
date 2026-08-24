import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { getPublishedPost, listPublishedPosts } from '../server/posts'
import { PostView } from '../components/post-view'
import { Comments } from '../components/comments'
import { ChevronIcon } from '../svgs'

export const Route = createFileRoute('/posts/$slug')({
  loader: async ({ params }) => {
    const [post, list] = await Promise.all([
      getPublishedPost({ data: params.slug }),
      listPublishedPosts(),
    ])
    return { post, list }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.post.title ?? '글'} · 양수빈 블로그` }],
  }),
  component: PostPage,
})

function PostPage() {
  const { post, list } = Route.useLoaderData()

  const articles = post.book ? [] : list.filter((p) => !p.book)
  const idx = articles.findIndex((p) => p.slug === post.slug)
  const next = idx > 0 ? articles[idx - 1] : null
  const prev = idx >= 0 && idx < articles.length - 1 ? articles[idx + 1] : null

  const shelf = useMemo(
    () => list.filter((p) => p.book && p.slug !== post.slug).slice(0, 4),
    [list, post.slug],
  )

  return (
    <PostView post={post} shelf={shelf}>
      {(prev || next) && (
        <nav className="post-nav">
          {prev ? (
            <Link to="/posts/$slug" params={{ slug: prev.slug! }}>
              <span className="dir">
                <ChevronIcon dir="left" />
                이전 글
              </span>
              <span className="nav-title">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to="/posts/$slug"
              params={{ slug: next.slug! }}
              className="next"
            >
              <span className="dir">
                다음 글
                <ChevronIcon dir="right" />
              </span>
              <span className="nav-title">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
      <Comments />
    </PostView>
  )
}
