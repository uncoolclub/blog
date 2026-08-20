import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { notFound } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { renderPostHTML } from '@blog/editor/html'
import type { JSONContent } from '@blog/editor/html'

export interface PostRow {
  id: number
  slug: string | null
  title: string
  content: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export type PostListItem = Pick<
  PostRow,
  'id' | 'slug' | 'title' | 'status' | 'published_at' | 'updated_at'
>

const db = () => env.DB

// 어드민 인증. 로그인 UI는 Cloudflare Access(/write* 경로 보호)가 담당하지만,
// server fn RPC는 경로 기반 보호가 안 닿으므로 Access가 발급한 JWT를 여기서 직접 검증한다.
// ACCESS_TEAM_DOMAIN/ACCESS_AUD 미설정 시 프로덕션은 fail-closed.
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined

export const assertAdmin = createServerOnlyFn(async () => {
  if (import.meta.env.DEV) return
  const { ACCESS_TEAM_DOMAIN, ACCESS_AUD } = env
  if (!ACCESS_TEAM_DOMAIN || !ACCESS_AUD) {
    throw new Response('Forbidden', { status: 403 })
  }
  const req = getRequest()
  const token =
    req.headers.get('cf-access-jwt-assertion') ??
    req.headers
      .get('cookie')
      ?.match(/(?:^|;\s*)CF_Authorization=([^;]+)/)?.[1]
  if (!token) throw new Response('Forbidden', { status: 403 })
  jwks ??= createRemoteJWKSet(
    new URL(`${ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`),
  )
  try {
    await jwtVerify(token, jwks, {
      issuer: ACCESS_TEAM_DOMAIN,
      audience: ACCESS_AUD,
    })
  } catch {
    throw new Response('Forbidden', { status: 403 })
  }
})

export const listPublishedPosts = createServerFn().handler(async () => {
  const { results } = await db()
    .prepare(
      `SELECT id, slug, title, status, published_at, updated_at
       FROM posts WHERE status = 'published'
       ORDER BY published_at DESC`,
    )
    .all<PostListItem>()
  return results
})

export const getPublishedPost = createServerFn()
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const row = await db()
      .prepare(`SELECT * FROM posts WHERE slug = ? AND status = 'published'`)
      .bind(slug)
      .first<PostRow>()
    if (!row) throw notFound()
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      publishedAt: row.published_at,
      html: renderPostHTML(JSON.parse(row.content) as JSONContent),
    }
  })

export const adminListPosts = createServerFn().handler(async () => {
  await assertAdmin()
  const { results } = await db()
    .prepare(
      `SELECT id, slug, title, status, published_at, updated_at
       FROM posts ORDER BY updated_at DESC`,
    )
    .all<PostListItem>()
  return results
})

export const adminGetPost = createServerFn()
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    await assertAdmin()
    const row = await db()
      .prepare(`SELECT * FROM posts WHERE id = ?`)
      .bind(id)
      .first<PostRow>()
    if (!row) throw notFound()
    return { ...row, content: JSON.parse(row.content) as JSONContent }
  })

export const createPost = createServerFn({ method: 'POST' }).handler(
  async () => {
    await assertAdmin()
    const row = await db()
      .prepare(`INSERT INTO posts DEFAULT VALUES RETURNING id`)
      .first<{ id: number }>()
    return row!.id
  },
)

export const savePost = createServerFn({ method: 'POST' })
  .validator(
    (data: { id: number; title: string; content: JSONContent }) => data,
  )
  .handler(async ({ data }) => {
    await assertAdmin()
    await db()
      .prepare(
        `UPDATE posts SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?`,
      )
      .bind(data.title, JSON.stringify(data.content), data.id)
      .run()
  })

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const publishPost = createServerFn({ method: 'POST' })
  .validator((data: { id: number; slug?: string }) => data)
  .handler(async ({ data }) => {
    await assertAdmin()
    const row = await db()
      .prepare(`SELECT title, slug, published_at FROM posts WHERE id = ?`)
      .bind(data.id)
      .first<Pick<PostRow, 'title' | 'slug' | 'published_at'>>()
    if (!row) throw notFound()

    const slug =
      data.slug?.trim() || row.slug || slugify(row.title) || `post-${data.id}`
    try {
      await db()
        .prepare(
          `UPDATE posts SET status = 'published', slug = ?,
           published_at = COALESCE(published_at, datetime('now')),
           updated_at = datetime('now') WHERE id = ?`,
        )
        .bind(slug, data.id)
        .run()
      return slug
    } catch {
      // slug UNIQUE 충돌 → id를 붙여 한 번만 재시도
      const fallback = `${slug}-${data.id}`
      await db()
        .prepare(
          `UPDATE posts SET status = 'published', slug = ?,
           published_at = COALESCE(published_at, datetime('now')),
           updated_at = datetime('now') WHERE id = ?`,
        )
        .bind(fallback, data.id)
        .run()
      return fallback
    }
  })

export const unpublishPost = createServerFn({ method: 'POST' })
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    await assertAdmin()
    await db()
      .prepare(
        `UPDATE posts SET status = 'draft', updated_at = datetime('now') WHERE id = ?`,
      )
      .bind(id)
      .run()
  })

export const deletePost = createServerFn({ method: 'POST' })
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    await assertAdmin()
    await db().prepare(`DELETE FROM posts WHERE id = ?`).bind(id).run()
  })
