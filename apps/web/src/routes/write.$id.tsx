import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Editor } from '@blog/editor'
import type { EmbedMeta, JSONContent } from '@blog/editor'
import {
  adminGetPost,
  deletePost,
  publishPost,
  savePost,
  unpublishPost,
} from '../server/posts'
import type { Book } from '../server/posts'

export const Route = createFileRoute('/write/$id')({
  params: {
    parse: (raw) => ({ id: Number(raw.id) }),
    stringify: (params) => ({ id: String(params.id) }),
  },
  loader: ({ params }) => adminGetPost({ data: params.id }),
  component: WritePage,
})

type SaveState = 'saved' | 'saving' | 'dirty'

const EMPTY_BOOK: Book = { title: '', author: '', quotes: [], toc: [] }

function WritePage() {
  const post = Route.useLoaderData()
  const router = useRouter()

  const [title, setTitle] = useState(post.title)
  const [status, setStatus] = useState(post.status)
  const [slug, setSlug] = useState(post.slug ?? '')
  const [book, setBookState] = useState<Book | null>(post.book)
  const [saveState, setSaveState] = useState<SaveState>('saved')

  const latest = useRef({
    title: post.title,
    content: post.content,
    book: post.book,
  })
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const flush = useCallback(async () => {
    clearTimeout(timer.current)
    setSaveState('saving')
    await savePost({
      data: {
        id: post.id,
        title: latest.current.title,
        content: latest.current.content,
        book: latest.current.book,
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

  const setBook = useCallback(
    (next: Book | null) => {
      setBookState(next)
      latest.current.book = next
      scheduleSave()
    },
    [scheduleSave],
  )

  const patchBook = useCallback(
    (patch: Partial<Book>) => setBook({ ...(book ?? EMPTY_BOOK), ...patch }),
    [book, setBook],
  )

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

  async function unfurl(url: string) {
    const res = await fetch(`/api/unfurl?url=${encodeURIComponent(url)}`)
    if (!res.ok) throw new Error(`unfurl failed: ${res.status}`)
    return res.json() as Promise<Partial<EmbedMeta>>
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

      <label className="book-toggle">
        <input
          type="checkbox"
          checked={book !== null}
          onChange={(e) => setBook(e.target.checked ? EMPTY_BOOK : null)}
        />
        서평
      </label>

      {book && (
        <div className="book-form">
          <div className="book-form-row">
            <input
              placeholder="책 제목"
              value={book.title}
              onChange={(e) => patchBook({ title: e.target.value })}
            />
            <input
              placeholder="지은이"
              value={book.author}
              onChange={(e) => patchBook({ author: e.target.value })}
            />
          </div>
          <div className="book-form-row">
            <input
              placeholder="옮긴이"
              value={book.translator ?? ''}
              onChange={(e) => patchBook({ translator: e.target.value })}
            />
            <input
              placeholder="출판사"
              value={book.publisher ?? ''}
              onChange={(e) => patchBook({ publisher: e.target.value })}
            />
          </div>
          <div className="book-form-row">
            <input
              type="number"
              min={0}
              max={5}
              step={0.5}
              placeholder="평점"
              value={book.rating ?? ''}
              onChange={(e) =>
                patchBook({
                  rating:
                    e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
            />
            <input
              placeholder="읽기 시작 (2026.07)"
              value={book.readFrom ?? ''}
              onChange={(e) => patchBook({ readFrom: e.target.value })}
            />
            <input
              placeholder="완독 (2026.08)"
              value={book.readTo ?? ''}
              onChange={(e) => patchBook({ readTo: e.target.value })}
            />
          </div>
          <input
            placeholder="한 줄 평"
            value={book.oneLiner ?? ''}
            onChange={(e) => patchBook({ oneLiner: e.target.value })}
          />

          <div className="book-form-row cover">
            <input
              placeholder="표지 URL"
              value={book.coverUrl ?? ''}
              onChange={(e) => patchBook({ coverUrl: e.target.value })}
            />
            <label className="upload-btn">
              표지 업로드
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  patchBook({ coverUrl: await uploadImage(file) })
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          <ListField
            label="문장들"
            rows={book.quotes}
            blank={{ text: '' }}
            onChange={(quotes) => patchBook({ quotes })}
            render={(quote, patch) => (
              <>
                <input
                  placeholder="문장"
                  value={quote.text}
                  onChange={(e) => patch({ text: e.target.value })}
                />
                <input
                  className="narrow"
                  placeholder="쪽"
                  value={quote.page ?? ''}
                  onChange={(e) => patch({ page: e.target.value })}
                />
              </>
            )}
          />

          <ListField
            label="목차"
            rows={book.toc}
            blank={{ title: '' }}
            onChange={(toc) => patchBook({ toc })}
            render={(entry, patch) => (
              <>
                <input
                  placeholder="장 제목"
                  value={entry.title}
                  onChange={(e) => patch({ title: e.target.value })}
                />
                <input
                  className="narrow"
                  placeholder="메모"
                  value={entry.note ?? ''}
                  onChange={(e) => patch({ note: e.target.value })}
                />
              </>
            )}
          />
        </div>
      )}

      <Editor
        initialContent={post.content as JSONContent}
        onChange={(content) => {
          latest.current.content = content
          scheduleSave()
        }}
        uploadImage={uploadImage}
        unfurl={unfurl}
      />
    </div>
  )
}

function ListField<T>({
  label,
  rows,
  blank,
  onChange,
  render,
}: {
  label: string
  rows: T[]
  blank: T
  onChange: (rows: T[]) => void
  render: (row: T, patch: (patch: Partial<T>) => void) => React.ReactNode
}) {
  return (
    <div className="book-list-field">
      <span className="book-form-label">{label}</span>
      {rows.map((row, i) => (
        <div key={i} className="book-form-row">
          {render(row, (patch) =>
            onChange(rows.map((r, j) => (i === j ? { ...r, ...patch } : r))),
          )}
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, j) => i !== j))}
          >
            −
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...rows, blank])}>
        + {label} 추가
      </button>
    </div>
  )
}
