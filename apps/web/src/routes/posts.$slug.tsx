import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { getPublishedPost, listPublishedPosts } from '../server/posts'
import { PostView } from '../components/post-view'
import { Comments } from '../components/comments'
import { ChevronIcon } from '../svgs'
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl, toDate } from '../lib/site'

export const Route = createFileRoute('/posts/$slug')({
  loader: async ({ params }) => {
    const [post, list] = await Promise.all([
      getPublishedPost({ data: params.slug }),
      listPublishedPosts(),
    ])
    return { post, list }
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post
    if (!post) return { meta: [{ title: `글 · ${SITE_NAME}` }] }
    const title = `${post.title} · ${SITE_NAME}`
    const description = post.book?.oneLiner || post.excerpt
    const image = post.cover ?? post.book?.coverUrl
    const author = { '@type': 'Person', name: '양수빈', url: absoluteUrl('/about') }
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description,
      image: absoluteUrl(image ?? DEFAULT_OG_IMAGE),
      datePublished: post.publishedAt
        ? toDate(post.publishedAt).toISOString()
        : undefined,
      dateModified: toDate(post.updatedAt).toISOString(),
      author,
      publisher: author,
      mainEntityOfPage: absoluteUrl(`/posts/${params.slug}`),
      inLanguage: 'ko',
      ...(post.book && {
        about: { '@type': 'Book', name: post.book.title, author: post.book.author },
      }),
    }
    return {
      scripts: [{ type: 'application/ld+json', children: JSON.stringify(jsonLd) }],
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: description },
        ...(image
          ? [{ property: 'og:image', content: absoluteUrl(image) }]
          : []),
        ...(post.publishedAt
          ? [
              {
                property: 'article:published_time',
                content: toDate(post.publishedAt).toISOString(),
              },
            ]
          : []),
        {
          property: 'article:modified_time',
          content: toDate(post.updatedAt).toISOString(),
        },
      ],
    }
  },
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
