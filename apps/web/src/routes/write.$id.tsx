import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Editor } from '@blog/editor'
import type { JSONContent } from '@blog/editor'
import {
  adminGetPost,
  deletePost,
  publishPost,
  savePost,
  unpublishPost,
} from '../server/posts'

export const Route = createFileRoute('/write/$id')({
  params: {
    parse: (raw) => ({ id: Number(raw.id) }),
    stringify: (params) => ({ id: String(params.id) }),
  },
  loader: ({ params }) => adminGetPost({ data: params.id }),
  component: WritePage,
})

type SaveState = 'saved' | 'saving' | 'dirty'

function WritePage() {
  const post = Route.useLoaderData()
  const router = useRouter()

  const [title, setTitle] = useState(post.title)
  const [status, setStatus] = useState(post.status)
  const [slug, setSlug] = useState(post.slug ?? '')
  const [saveState, setSaveState] = useState<SaveState>('saved')

  const latest = useRef({ title: post.title, content: post.content })
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const flush = useCallback(async () => {
    clearTimeout(timer.current)
    setSaveState('saving')
    await savePost({
      data: {
        id: post.id,
        title: latest.current.title,
        content: latest.current.content,
      },
    })
    setSaveState('saved')
  }, [post.id])

  const scheduleSave = useCallback(() => {
    setSaveState('dirty')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => void flush(), 800)
  }, [flush])

  useEffect(() => () => clearTimeout(timer.current), [])

  async function onPublish() {
    await flush()
    const finalSlug = await publishPost({
      data: { id: post.id, slug: slug || undefined },
    })
    setSlug(finalSlug)
    setStatus('published')
  }

  async function onUnpublish() {
    await unpublishPost({ data: post.id })
    setStatus('draft')
  }

  async function onDelete() {
    if (!confirm('이 글을 삭제할까? 되돌릴 수 없어.')) return
    await deletePost({ data: post.id })
    await router.navigate({ to: '/write' })
  }

  async function uploadImage(file: File): Promise<string> {
    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body })
    if (!res.ok) throw new Error(`upload failed: ${res.status}`)
    const { url } = (await res.json()) as { url: string }
    return url
  }

  return (
    <div className="write-page">
      <div className="write-bar">
        <Link to="/write" className="back">
          ← 목록
        </Link>
        <span className="save-state" data-state={saveState}>
          {saveState === 'saved'
            ? '저장됨'
            : saveState === 'saving'
              ? '저장 중…'
              : '작성 중'}
        </span>
        <div className="write-actions">
          {status === 'published' ? (
            <>
              {slug && (
                <Link
                  to="/posts/$slug"
                  params={{ slug }}
                  target="_blank"
                  className="view-link"
                >
                  보기
                </Link>
              )}
              <button type="button" onClick={onUnpublish}>
                발행 취소
              </button>
            </>
          ) : (
            <button type="button" className="primary" onClick={onPublish}>
              발행
            </button>
          )}
          <button type="button" className="danger" onClick={onDelete}>
            삭제
          </button>
        </div>
      </div>

      <input
        className="title-input"
        placeholder="제목"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
          latest.current.title = e.target.value
          scheduleSave()
        }}
      />

      <input
        className="slug-input"
        placeholder="slug (비우면 제목으로 생성)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />

      <Editor
        initialContent={post.content as JSONContent}
        onChange={(content) => {
          latest.current.content = content
          scheduleSave()
        }}
        uploadImage={uploadImage}
      />
    </div>
  )
}
