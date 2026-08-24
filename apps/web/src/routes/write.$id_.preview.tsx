import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { listPublishedPosts, previewPost } from '../server/posts'
import { PostView } from '../components/post-view'

export const Route = createFileRoute('/write/$id_/preview')({
  params: {
    parse: (raw) => ({ id: Number(raw.id) }),
    stringify: (params) => ({ id: String(params.id) }),
  },
  loader: async ({ params }) => {
    const [post, list] = await Promise.all([
      previewPost({ data: params.id }),
      listPublishedPosts(),
    ])
    return { post, list }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `미리보기 · ${loaderData?.post.title ?? '글'}` }],
  }),
  component: PreviewPage,
})

function PreviewPage() {
  const { post, list } = Route.useLoaderData()

  const shelf = useMemo(
    () => list.filter((p) => p.book && p.id !== post.id).slice(0, 4),
    [list, post.id],
  )

  return (
    <PostView
      post={post}
      shelf={shelf}
      banner={
        <div className="preview-banner">
          <span className="chip">
            {post.publishedAt ? '미리보기' : '미리보기 · 발행되지 않은 초안'}
          </span>
        </div>
      }
    />
  )
}
