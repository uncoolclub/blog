import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode, Ref } from 'react'
import { CoverImage } from './book'
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
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const q = query.trim()
    setResults([])
    setActive(0)
    if (!q) {
      setStatus('idle')
      return
    }
    setStatus('loading')
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/books/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        )
        const data = (await res.json().catch(() => ({}))) as {
          results?: BookSearchResult[]
          error?: string
        }
        if (controller.signal.aborted) return
        if (!res.ok) {
          setErrorCode(data.error)
          setStatus('error')
          return
        }
        setResults(data.results ?? [])
        setStatus('done')
      } catch {
        if (controller.signal.aborted) return
        setErrorCode(undefined)
        setStatus('error')
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (status === 'done' && results[active]) onSelect(results[active])
    } else if (results.length > 0 && e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (results.length > 0 && e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + results.length) % results.length)
    }
  }

  return (
    <div className="book-search">
      <div className="book-search-bar">
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
          maxLength={100}
          placeholder="제목, 지은이, ISBN으로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="button" onClick={onCancel}>
          취소
        </button>
      </div>

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

      {onManual && (
        <button type="button" className="book-search-manual" onClick={onManual}>
          찾는 책이 없으면 직접 입력
        </button>
      )}
    </div>
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
  onUnlink,
}: {
  book: Book
  triggerRef: Ref<HTMLButtonElement>
  onChange: () => void
  onUnlink: () => void
}) {
  return (
    <div className="book-link-card">
      <Cover url={book.coverUrl} fallback={book.coverFallbackUrl} />
      <span className="book-link-text">
        <span className="book-link-title" data-empty={!book.title || undefined}>
          {book.title || '책 제목을 입력해 줘'}
        </span>
        <span className="book-link-meta">{metaOf(book)}</span>
      </span>
      <span className="book-link-actions">
        <button ref={triggerRef} type="button" onClick={onChange}>
          변경
        </button>
        <button type="button" onClick={onUnlink}>
          연결 해제
        </button>
      </span>
    </div>
  )
}

export function BookPicker({
  book,
  onSelect,
  onManual,
  onUnlink,
  children,
}: {
  book: Book | null
  onSelect: (result: BookSearchResult) => void
  onManual: () => void
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
    return search ? (
      <section className="book-panel" aria-label="책 연결">
        {search}
      </section>
    ) : (
      <button
        ref={triggerRef}
        type="button"
        className="book-link-trigger"
        onClick={() => setSearching(true)}
      >
        + 책 연결
      </button>
    )
  }

  return (
    <section className="book-panel" aria-label="연결된 책">
      {search || (
        <LinkedBook
          book={book}
          triggerRef={triggerRef}
          onChange={() => setSearching(true)}
          onUnlink={onUnlink}
        />
      )}
      {children}
    </section>
  )
}
