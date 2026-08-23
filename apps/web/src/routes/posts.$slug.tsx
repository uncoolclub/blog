import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'
import { getPublishedPost, listPublishedPosts } from '../server/posts'
import { ChevronIcon } from '../svgs'
import { formatDate } from './index'

export const Route = createFileRoute('/posts/$slug')({
  loader: async ({ params }) => {
    const [post, list] = await Promise.all([
      getPublishedPost({ data: params.slug }),
      listPublishedPosts(),
    ])
    return { post, list }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.post.title ?? '글'} · yang-meli.tech` }],
  }),
  component: PostPage,
})

// giscus (GitHub Discussions 댓글). 레포에 Discussions를 켜고
// https://giscus.app 에서 발급받은 값을 채우면 활성화된다.
const GISCUS = {
  repo: '',
  repoId: '',
  category: '',
  categoryId: '',
}

function Comments() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!GISCUS.repo || !ref.current || ref.current.hasChildNodes()) return
    const s = document.createElement('script')
    s.src = 'https://giscus.app/client.js'
    s.async = true
    s.crossOrigin = 'anonymous'
    Object.entries({
      'data-repo': GISCUS.repo,
      'data-repo-id': GISCUS.repoId,
      'data-category': GISCUS.category,
      'data-category-id': GISCUS.categoryId,
      'data-mapping': 'pathname',
      'data-reactions-enabled': '1',
      'data-input-position': 'bottom',
      'data-theme': 'preferred_color_scheme',
      'data-lang': 'ko',
    }).forEach(([k, v]) => s.setAttribute(k, v))
    ref.current.appendChild(s)
  }, [])

  if (!GISCUS.repo) return null
  return <div className="comments" ref={ref} />
}

function PostPage() {
  const { post, list } = Route.useLoaderData()
  const articleRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const idx = list.findIndex((p) => p.slug === post.slug)
  // 목록은 최신순: 다음 글 = 더 최신(idx-1), 이전 글 = 더 오래됨(idx+1)
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
    // 코드 블록 신택스 하이라이트는 클라이언트에서 한 번만 입힌다.
    if (!articleRef.current?.querySelector('pre > code')) return
    void import('@blog/editor/highlight').then(({ highlightCodeBlocks }) => {
      if (articleRef.current) highlightCodeBlocks(articleRef.current)
    })
  }, [post.id])

  // 읽기 진행 바: 리렌더 없이 DOM에 직접 반영
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
