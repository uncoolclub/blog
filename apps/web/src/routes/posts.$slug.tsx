import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { getPublishedPost } from '../server/posts'
import { formatDate } from './index'

export const Route = createFileRoute('/posts/$slug')({
  loader: ({ params }) => getPublishedPost({ data: params.slug }),
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title ?? '글'} · yang-meli.tech` }],
  }),
  component: PostPage,
})

function PostPage() {
  const post = Route.useLoaderData()
  const articleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 코드 블록 신택스 하이라이트는 클라이언트에서 한 번만 입힌다.
    if (!articleRef.current?.querySelector('pre > code')) return
    void import('@blog/editor/highlight').then(({ highlightCodeBlocks }) => {
      if (articleRef.current) highlightCodeBlocks(articleRef.current)
    })
  }, [post.id])

  return (
    <article className="post">
      <header className="post-header">
        <h1>{post.title}</h1>
        {post.publishedAt && (
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        )}
      </header>
      <div
        ref={articleRef}
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  )
}
