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
import { BookPicker } from '../components/book-picker'
import {
  DateField,
  Modal,
  QuoteSection,
  StarInput,
  TocSection,
  growTextarea,
} from '../components/review-fields'
import { dominantColor } from '../lib/dominant-color'
import { BackIcon, TrashIcon } from '../svgs'
import { isKakaoCover } from '../lib/kakao-book'
import type { BookSearchResult } from '../lib/kakao-book'

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

const hasReviewContent = (book: Book) =>
  book.rating != null ||
  Boolean(book.readFrom?.trim()) ||
  Boolean(book.readTo?.trim()) ||
  Boolean(book.oneLiner?.trim()) ||
  book.quotes.some((quote) => quote.text.trim() || quote.page?.trim()) ||
  book.toc.some((entry) => entry.title.trim() || entry.note?.trim())

function WritePage() {
  const post = Route.useLoaderData()
  const router = useRouter()

  const [title, setTitle] = useState(post.title)
  const [status, setStatus] = useState(post.status)
  const [slug, setSlug] = useState(post.slug ?? '')
  const [book, setBookState] = useState<Book | null>(post.book)
  const [biblioOpen, setBiblioOpen] = useState(false)
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
    (patch: Partial<Book>) =>
      setBook({ ...(latest.current.book ?? EMPTY_BOOK), ...patch }),
    [setBook],
  )

  const pickCoverColor = useCallback(
    async (coverUrl?: string, fallbackUrl?: string) => {
      if (!coverUrl) return
      const colorOf = (url: string) =>
        dominantColor(
          isKakaoCover(url)
            ? `/api/books/cover?url=${encodeURIComponent(url)}`
            : url,
        )
      const coverColor =
        (await colorOf(coverUrl)) ??
        (fallbackUrl ? await colorOf(fallbackUrl) : null)
      if (coverColor && latest.current.book?.coverUrl === coverUrl) {
        patchBook({ coverColor })
      }
    },
    [patchBook],
  )

  const loadToc = useCallback(
    async (isbn: string | undefined, replace: boolean) => {
      if (!isbn) return
      const res = await fetch(`/api/books/toc?isbn=${isbn}`).catch(() => null)
      if (!res?.ok) return
      const { toc, itemId } = (await res.json()) as {
        toc: Book['toc']
        itemId?: number
      }
      const current = latest.current.book
      if (current?.isbn !== isbn || toc.length === 0) return
      if (replace || current.toc.length === 0) {
        patchBook({ toc, yes24ItemId: itemId })
      }
    },
    [patchBook],
  )

  useEffect(() => {
    if (post.book?.toc.length === 0) void loadToc(post.book.isbn, false)
  }, [post.book, loadToc])

  const selectBook = useCallback(
    (result: BookSearchResult) => {
      const autoToc = latest.current.book?.yes24ItemId != null
      patchBook({
        ...(autoToc ? { toc: [], yes24ItemId: undefined } : {}),
        translator: undefined,
        publisher: undefined,
        coverUrl: undefined,
        coverFallbackUrl: undefined,
        isbn: undefined,
        ...result,
        coverColor: undefined,
      })
      setBiblioOpen(false)
      void pickCoverColor(result.coverUrl, result.coverFallbackUrl)
      void loadToc(result.isbn, true)
    },
    [patchBook, pickCoverColor, loadToc],
  )

  const unlinkBook = useCallback(() => {
    const current = latest.current.book
    if (
      current &&
      hasReviewContent(current) &&
      !confirm(
        '책 연결을 해제할까? 입력한 별점, 기간, 한 줄 평, 문장, 목차가 지워져.',
      )
    ) {
      return
    }
    setBook(null)
    setBiblioOpen(false)
  }, [setBook])

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
    <div className="write-page" data-mode={book ? 'review' : undefined}>
      <div className="write-bar">
        <Link to="/write" className="back">
          <BackIcon />
          목록
        </Link>
        <span className="save-state" data-state={saveState}>
          {saveState === 'saved'
            ? '저장됨'
            : saveState === 'saving'
              ? '저장 중…'
              : '작성 중'}
        </span>
        <div className="write-actions">
          <button
            type="button"
            className="danger"
            aria-label="삭제"
            title="삭제"
            onClick={onDelete}
          >
            <TrashIcon />
          </button>
          <Link
            to="/write/$id/preview"
            params={{ id: post.id }}
            target="_blank"
            className="view-link"
          >
            미리보기
          </Link>
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
            <PublishMenu slug={slug} onSlugChange={setSlug} onPublish={onPublish} />
          )}
        </div>
      </div>

      <input
        className="title-input"
        placeholder={book?.title || '제목'}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
          latest.current.title = e.target.value
          scheduleSave()
        }}
      />

      <BookPicker
        book={book}
        onSelect={selectBook}
        onManual={() => {
          setBook(EMPTY_BOOK)
          setBiblioOpen(true)
        }}
        onEdit={() => setBiblioOpen(true)}
        onUnlink={unlinkBook}
      >
        {book && (
          <div className="review-meta">
            <StarInput
              value={book.rating}
              onChange={(rating) => patchBook({ rating })}
            />
            <div className="review-period">
              <DateField
                label="읽기 시작"
                value={book.readFrom}
                max={book.readTo}
                onChange={(readFrom) => patchBook({ readFrom })}
              />
              <span aria-hidden="true">~</span>
              <DateField
                label="완독"
                value={book.readTo}
                min={book.readFrom}
                onChange={(readTo) => patchBook({ readTo })}
              />
            </div>
            <textarea
              ref={growTextarea}
              className="review-oneliner"
              rows={1}
              aria-label="한 줄 평"
              placeholder="한 줄 평"
              value={book.oneLiner ?? ''}
              onChange={(e) => patchBook({ oneLiner: e.target.value })}
            />
          </div>
        )}
      </BookPicker>

      {book && biblioOpen && (
        <Modal label="서지 수정" onClose={() => setBiblioOpen(false)}>
          <div className="book-form">
            <h2 className="review-block-title">서지 수정</h2>
              <div className="book-form-row">
                <label className="biblio-field">
                  <span>책 제목</span>
                  <input
                  value={book.title}
                  onChange={(e) => patchBook({ title: e.target.value })}
                                  />
                </label>
                <label className="biblio-field">
                  <span>지은이</span>
                  <input
                  value={book.author}
                  onChange={(e) => patchBook({ author: e.target.value })}
                                  />
                </label>
              </div>
              <div className="book-form-row">
                <label className="biblio-field">
                  <span>옮긴이</span>
                  <input
                  value={book.translator ?? ''}
                  onChange={(e) => patchBook({ translator: e.target.value })}
                                  />
                </label>
                <label className="biblio-field">
                  <span>출판사</span>
                  <input
                  value={book.publisher ?? ''}
                  onChange={(e) => patchBook({ publisher: e.target.value })}
                                  />
                </label>
              </div>
              <div className="book-form-row cover">
                <label className="biblio-field">
                  <span>표지 URL</span>
                  <input
                  value={book.coverUrl ?? ''}
                  onChange={(e) =>
                    patchBook({
                      coverUrl: e.target.value,
                      coverFallbackUrl: undefined,
                    })
                  }
                  onBlur={(e) => void pickCoverColor(e.target.value)}
                                  />
                </label>
                <label className="upload-btn">
                  업로드
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const coverUrl = await uploadImage(file)
                      patchBook({ coverUrl, coverFallbackUrl: undefined })
                      e.target.value = ''
                      await pickCoverColor(coverUrl)
                    }}
                  />
                </label>
              </div>
            <button
              type="button"
              className="biblio-done"
              onClick={() => setBiblioOpen(false)}
            >
              완료
            </button>
          </div>
        </Modal>
      )}

      {book && (
        <>
          <QuoteSection
            quotes={book.quotes}
            chapters={book.toc.map((entry) => entry.title)}
            onChange={(quotes) => patchBook({ quotes })}
          />
          <TocSection toc={book.toc} onChange={(toc) => patchBook({ toc })} />
        </>
      )}

      <section className="write-body">
        {book && <h2 className="review-block-title">읽고 나서</h2>}
        <Editor
          initialContent={post.content as JSONContent}
          onChange={(content) => {
            latest.current.content = content
            scheduleSave()
          }}
          uploadImage={uploadImage}
          unfurl={unfurl}
          compactToolbar={book !== null}
        />
      </section>
    </div>
  )
}

function PublishMenu({
  slug,
  onSlugChange,
  onPublish,
}: {
  slug: string
  onSlugChange: (slug: string) => void
  onPublish: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={menuRef} className="publish-menu">
      <button
        ref={triggerRef}
        type="button"
        className="primary"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        발행
      </button>
      {open && (
        <form
          className="publish-panel"
          role="dialog"
          aria-label="발행 설정"
          onKeyDown={(e) => {
            if (e.key !== 'Escape') return
            e.preventDefault()
            setOpen(false)
            triggerRef.current?.focus()
          }}
          onSubmit={async (e) => {
            e.preventDefault()
            if (publishing) return
            setPublishing(true)
            try {
              await onPublish()
            } finally {
              setPublishing(false)
            }
          }}
        >
          <label>
            <span>글 주소</span>
            <span className="publish-slug">
              <span aria-hidden="true">/posts/</span>
              <input
                autoFocus
                placeholder="자동 생성"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
              />
            </span>
          </label>
          <button type="submit" className="primary" disabled={publishing}>
            {publishing ? '발행 중…' : '발행하기'}
          </button>
        </form>
      )}
    </div>
  )
}
