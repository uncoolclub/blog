import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'
import { getPublishedPost, listPublishedPosts } from '../server/posts'
import { Comments } from '../components/comments'
import { ChevronIcon } from '../svgs'
import { formatDate } from '../lib/date'

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
  const articleRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const idx = list.findIndex((p) => p.slug === post.slug)
  const next = idx > 0 ? list[idx - 1] : null
  const prev = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null

  const words = useMemo(
    () =>
      post.html
        .replace(/<[^>]*>/g, ' ')
        .trim()
        .split(/\s+/).length,
    [post.html],
  )

  useEffect(() => {
    if (!articleRef.current?.querySelector('pre > code, .embed-youtube')) return
    void import('@blog/editor/highlight').then(({ enhancePost }) => {
      if (articleRef.current) enhancePost(articleRef.current)
    })
  }, [post.id])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max ? el.scrollTop / max : 0})`
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [post.id])

  return (
    <article className="post">
      <div className="post-progress" ref={progressRef} aria-hidden="true" />
      <header className="post-header">
        <h1>{post.title}</h1>
        <p className="post-meta">
          {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'} · {words}{' '}
          words
        </p>
      </header>
      <div
        ref={articleRef}
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
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
    </article>
  )
}
