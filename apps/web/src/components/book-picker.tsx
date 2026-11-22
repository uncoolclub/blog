import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode, Ref } from 'react'
import { CoverImage } from './book'
import { EditIcon, MoreIcon } from '../svgs'
import type { BookSearchResult } from '../lib/kakao-book'
import type { Book } from '../server/posts'

type SearchStatus = 'idle' | 'loading' | 'done' | 'error'

const errorMessage = (code?: string) =>
  code === 'missing_key'
    ? '카카오 API 키가 설정되지 않았어.'
    : '검색에 실패했어. 잠시 후 다시 시도해 줘.'

function BookSearch({
  onSelect,
  onCancel,
  onManual,
}: {
  onSelect: (result: BookSearchResult) => void
  onCancel: () => void
  onManual?: () => void
}) {
  const listId = useId()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BookSearchResult[]>([])
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [errorCode, setErrorCode] = useState<string>()
  const [active, setActive] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const searchedRef = useRef('')
  const composingRef = useRef(false)
  const submitAfterCompositionRef = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => {
      requestRef.current?.abort()
      dialog?.close()
    }
  }, [])

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active])

  async function search(q: string) {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    searchedRef.current = q
    setStatus('loading')
    setActive(0)
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
      const data = (await res.json().catch(() => ({}))) as {
        results?: BookSearchResult[]
        error?: string
      }
      if (controller.signal.aborted) return
      if (!res.ok) {
        searchedRef.current = ''
        setResults([])
        setErrorCode(data.error)
        setStatus('error')
        return
      }
      setResults(data.results ?? [])
      setStatus('done')
    } catch {
      if (controller.signal.aborted) return
      searchedRef.current = ''
      setResults([])
      setErrorCode(undefined)
      setStatus('error')
    } finally {
      if (requestRef.current === controller) requestRef.current = null
    }
  }

  function submit(value = query) {
    const q = value.trim()
    if (!q) return
    if (q !== searchedRef.current) {
      void search(q)
      return
    }
    if (requestRef.current) return
    if (results[active]) onSelect(results[active])
    else void search(q)
  }

  function onQueryChange(value: string) {
    setQuery(value)
    const q = value.trim()
    if (!q) {
      requestRef.current?.abort()
      requestRef.current = null
      searchedRef.current = ''
      setResults([])
      setActive(0)
      setStatus('idle')
    } else if (q !== searchedRef.current && !requestRef.current) {
      setStatus('idle')
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.nativeEvent.isComposing) submitAfterCompositionRef.current = true
      else submit(e.currentTarget.value)
      return
    }
    if (e.nativeEvent.isComposing) return
    if (results.length > 0 && e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (results.length > 0 && e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + results.length) % results.length)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="book-search-dialog"
      aria-label="책 검색"
      onCancel={(e) => {
        e.preventDefault()
        if (!composingRef.current) onCancel()
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="book-search">
        <form
          className="book-search-bar"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            autoFocus
            role="combobox"
            aria-label="책 검색"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              results.length > 0 ? `${listId}-${active}` : undefined
            }
            enterKeyHint="search"
            maxLength={100}
            placeholder="책 검색"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
            onCompositionStart={() => {
              composingRef.current = true
            }}
            onCompositionEnd={(e) => {
              composingRef.current = false
              if (!submitAfterCompositionRef.current) return
              submitAfterCompositionRef.current = false
              setQuery(e.currentTarget.value)
              submit(e.currentTarget.value)
            }}
          />
          <button type="submit">검색</button>
        </form>

        <div className="book-search-status" role="status">
          {status === 'loading' && '찾는 중…'}
          {status === 'done' && results.length === 0 && '검색 결과가 없어.'}
          {status === 'error' && (
            <span className="book-search-error">{errorMessage(errorCode)}</span>
          )}
        </div>

        <ul ref={listRef} id={listId} role="listbox" aria-label="검색 결과">
          {results.map((result, i) => (
            <li
              key={result.isbn ?? `${result.title}-${i}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(result)}
            >
              <Cover url={result.coverFallbackUrl ?? result.coverUrl} />
              <span className="book-link-text">
                <span className="book-link-title">{result.title}</span>
                <span className="book-link-meta">{metaOf(result)}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="book-search-actions">
          {onManual && (
            <button type="button" onClick={onManual}>
              직접 입력
            </button>
          )}
          <button type="button" onClick={onCancel}>
            닫기
          </button>
        </div>
      </div>
    </dialog>
  )
}

const metaOf = (book: Pick<Book, 'author' | 'publisher'>) =>
  [book.author, book.publisher].filter(Boolean).join(' • ')

function Cover({ url, fallback }: { url?: string; fallback?: string }) {
  return url ? (
    <CoverImage
      className="book-link-cover"
      src={url}
      fallback={fallback}
      loading="lazy"
    />
  ) : (
    <span className="book-link-cover" aria-hidden="true" />
  )
}

function LinkedBook({
  book,
  triggerRef,
  onChange,
  onEdit,
  onUnlink,
  children,
}: {
  book: Book
  triggerRef: Ref<HTMLButtonElement>
  onChange: () => void
  onEdit: () => void
  onUnlink: () => void
  children?: ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const coverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!coverRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <div className="review-head">
      <div ref={coverRef} className="review-cover" data-open={menuOpen || undefined}>
        <Cover url={book.coverUrl} fallback={book.coverFallbackUrl} />
        <div className="review-cover-actions">
          <button type="button" className="review-cover-edit" onClick={onEdit}>
            <EditIcon />
            서지 수정
          </button>
          <button
            ref={triggerRef}
            type="button"
            className="review-cover-more"
            aria-label="책 메뉴"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MoreIcon />
          </button>
        </div>
        {menuOpen && (
          <div className="review-cover-menu" role="group" aria-label="책 메뉴">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onChange()
              }}
            >
              책 변경
            </button>
            <button
              type="button"
              data-danger
              onClick={() => {
                setMenuOpen(false)
                onUnlink()
              }}
            >
              연결 해제
            </button>
          </div>
        )}
      </div>
      <div className="review-head-main">
        <span className="book-link-text">
          <span
            className="book-link-title"
            data-empty={!book.title || undefined}
          >
            {book.title || '책 제목을 입력해 줘'}
          </span>
          <span className="book-link-meta">{metaOf(book)}</span>
        </span>
        {children}
      </div>
    </div>
  )
}

export function BookPicker({
  book,
  onSelect,
  onManual,
  onEdit,
  onUnlink,
  children,
}: {
  book: Book | null
  onSelect: (result: BookSearchResult) => void
  onManual: () => void
  onEdit: () => void
  onUnlink: () => void
  children?: ReactNode
}) {
  const [searching, setSearching] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const restoreFocus = useRef(false)

  useEffect(() => {
    if (searching || !restoreFocus.current) return
    restoreFocus.current = false
    triggerRef.current?.focus()
  }, [searching, book])

  const closeSearch = () => {
    restoreFocus.current = true
    setSearching(false)
  }

  const search = searching && (
    <BookSearch
      onCancel={closeSearch}
      onSelect={(result) => {
        onSelect(result)
        closeSearch()
      }}
      onManual={
        book
          ? undefined
          : () => {
              onManual()
              closeSearch()
            }
      }
    />
  )

  if (!book) {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          className="book-link-trigger"
          onClick={() => setSearching(true)}
        >
          + 책 연결
        </button>
        {search}
      </>
    )
  }

  return (
    <section className="book-panel" aria-label="연결된 책">
      <LinkedBook
        book={book}
        triggerRef={triggerRef}
        onChange={() => setSearching(true)}
        onEdit={onEdit}
        onUnlink={onUnlink}
      >
        {children}
      </LinkedBook>
      {search}
    </section>
  )
}
