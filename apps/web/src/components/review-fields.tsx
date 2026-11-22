import { useEffect, useId, useRef, useState } from 'react'
import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react'
import { STAR_OUTLINE, STAR_SOLID } from './book'
import { QuoteRail } from './quote-rail'
import { CalendarIcon, ChevronIcon } from '../svgs'
import type { Book, BookQuote, BookTocEntry } from '../server/posts'

const STARS = [0, 1, 2, 3, 4]
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function StarInput({
  value,
  onChange,
}: {
  value?: number
  onChange: (value?: number) => void
}) {
  const [hover, setHover] = useState<number>()
  const shown = hover ?? value ?? 0

  const fromPointer = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const steps = Math.ceil(((e.clientX - rect.left) / rect.width) * 10)
    return Math.min(5, Math.max(0.5, steps / 2))
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const current = value ?? 0
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowUp'
        ? Math.min(5, current + 0.5)
        : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
          ? Math.max(0, current - 0.5)
          : e.key === 'Home' || e.key === 'Delete' || e.key === 'Backspace'
            ? 0
            : e.key === 'End'
              ? 5
              : null
    if (next === null) return
    e.preventDefault()
    onChange(next === 0 ? undefined : next)
  }

  return (
    <div className="star-input">
      <div
        className="star-input-track"
        role="slider"
        tabIndex={0}
        aria-label="별점"
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={value ?? 0}
        aria-valuetext={value == null ? '별점 없음' : `${value}점`}
        onMouseMove={(e) => setHover(fromPointer(e))}
        onMouseLeave={() => setHover(undefined)}
        onClick={(e) => {
          const next = fromPointer(e)
          setHover(undefined)
          onChange(next === value ? undefined : next)
        }}
        onKeyDown={onKeyDown}
      >
        {STARS.map((i) => {
          const fill = Math.min(1, Math.max(0, shown - i))
          return (
            <span key={i} className="star-input-star">
              <svg viewBox="0 0 16 16" className="star-input-empty">
                <path d={STAR_OUTLINE} />
              </svg>
              {fill > 0 && (
                <span
                  className="star-input-fill"
                  style={{ '--star-fill': fill } as CSSProperties}
                >
                  <svg viewBox="0 0 16 16">
                    <path d={STAR_SOLID} />
                  </svg>
                </span>
              )}
            </span>
          )
        })}
      </div>
      {shown > 0 && <span className="star-input-score">{shown.toFixed(1)}</span>}
    </div>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')
const toKey = (y: number, m: number, d: number) =>
  `${y}.${pad(m + 1)}.${pad(d)}`

function parseDate(value?: string) {
  const match = /^(\d{4})\.(\d{1,2})(?:\.(\d{1,2}))?$/.exec(value ?? '')
  if (!match) return null
  const m = Number(match[2]) - 1
  if (m < 0 || m > 11) return null
  return { y: Number(match[1]), m, d: match[3] ? Number(match[3]) : undefined }
}

const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate()

function todayParts() {
  const now = new Date()
  return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() }
}

export function DateField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value?: string
  min?: string
  max?: string
  onChange: (value?: string) => void
}) {
  const [cursor, setCursor] = useState<{ y: number; m: number; d: number }>()
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const moveFocus = useRef(false)
  const open = cursor !== undefined

  const isDisabled = (key: string) =>
    (!!min && key.slice(0, min.length) < min) ||
    (!!max && key.slice(0, max.length) > max)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setCursor(undefined)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!cursor || !moveFocus.current) return
    moveFocus.current = false
    gridRef.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus()
  }, [cursor])

  function openCalendar() {
    const parsed = parseDate(value)
    const today = todayParts()
    moveFocus.current = true
    setCursor(
      parsed
        ? { y: parsed.y, m: parsed.m, d: parsed.d ?? 1 }
        : today,
    )
  }

  function close() {
    setCursor(undefined)
    triggerRef.current?.focus()
  }

  function pick(key?: string) {
    onChange(key)
    close()
  }

  function shiftMonth(delta: number, focus = false) {
    if (!cursor) return
    const first = new Date(cursor.y, cursor.m + delta, 1)
    const y = first.getFullYear()
    const m = first.getMonth()
    moveFocus.current = focus
    setCursor({ y, m, d: Math.min(cursor.d, daysIn(y, m)) })
  }

  function shiftDay(delta: number) {
    if (!cursor) return
    const next = new Date(cursor.y, cursor.m, cursor.d + delta)
    moveFocus.current = true
    setCursor({
      y: next.getFullYear(),
      m: next.getMonth(),
      d: next.getDate(),
    })
  }

  function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!cursor) return
    const weekday = new Date(cursor.y, cursor.m, cursor.d).getDay()
    const actions: Record<string, () => void> = {
      ArrowLeft: () => shiftDay(-1),
      ArrowRight: () => shiftDay(1),
      ArrowUp: () => shiftDay(-7),
      ArrowDown: () => shiftDay(7),
      Home: () => shiftDay(-weekday),
      End: () => shiftDay(6 - weekday),
      PageUp: () => shiftMonth(-1, true),
      PageDown: () => shiftMonth(1, true),
    }
    const action = actions[e.key]
    if (!action) return
    e.preventDefault()
    action()
  }

  const selected = parseDate(value)
  const today = todayParts()
  const todayKey = toKey(today.y, today.m, today.d)

  return (
    <div ref={wrapRef} className="date-field">
      <button
        ref={triggerRef}
        type="button"
        className="date-field-trigger"
        data-empty={!value || undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label}: ${value || '선택 안 함'}`}
        onClick={() => (open ? close() : openCalendar())}
      >
        <CalendarIcon />
        {value || label}
      </button>

      {cursor && (
        <div
          className="calendar"
          role="dialog"
          aria-label={`${label} 날짜 선택`}
          onKeyDown={(e) => {
            if (e.key !== 'Escape') return
            e.preventDefault()
            e.stopPropagation()
            close()
          }}
        >
          <div className="calendar-head">
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronIcon dir="left" />
            </button>
            <span aria-live="polite">
              {cursor.y}년 {cursor.m + 1}월
            </span>
            <button
              type="button"
              aria-label="다음 달"
              onClick={() => shiftMonth(1)}
            >
              <ChevronIcon dir="right" />
            </button>
          </div>

          <div className="calendar-grid" aria-hidden="true">
            {WEEKDAYS.map((day) => (
              <span key={day} className="calendar-weekday">
                {day}
              </span>
            ))}
          </div>

          <div ref={gridRef} className="calendar-grid" onKeyDown={onGridKeyDown}>
            {Array.from(
              { length: new Date(cursor.y, cursor.m, 1).getDay() },
              (_, i) => (
                <span key={`blank-${i}`} />
              ),
            )}
            {Array.from({ length: daysIn(cursor.y, cursor.m) }, (_, i) => {
              const d = i + 1
              const key = toKey(cursor.y, cursor.m, d)
              const isSelected =
                selected?.y === cursor.y &&
                selected.m === cursor.m &&
                selected.d === d
              return (
                <button
                  key={key}
                  type="button"
                  tabIndex={d === cursor.d ? 0 : -1}
                  disabled={isDisabled(key)}
                  data-today={key === todayKey || undefined}
                  aria-pressed={isSelected}
                  aria-label={`${cursor.y}년 ${cursor.m + 1}월 ${d}일`}
                  onClick={() => pick(key)}
                >
                  {d}
                </button>
              )
            })}
          </div>

          <div className="calendar-foot">
            <button
              type="button"
              disabled={isDisabled(todayKey)}
              onClick={() => pick(todayKey)}
            >
              오늘
            </button>
            <button type="button" disabled={!value} onClick={() => pick()}>
              지우기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function growTextarea(el: HTMLTextAreaElement | null) {
  if (!el || CSS.supports('field-sizing', 'content')) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

export function Modal({
  label,
  onClose,
  children,
}: {
  label: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={ref}
      className="book-search-dialog"
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {children}
    </dialog>
  )
}

type LineElement = HTMLInputElement | HTMLTextAreaElement

interface LineProps {
  'data-line': true
  onKeyDown: (e: KeyboardEvent<LineElement>) => void
  onCompositionEnd: () => void
}

function ReviewLines<T>({
  title,
  rows,
  blank,
  isBlank,
  collapseAfter,
  onChange,
  render,
}: {
  title: string
  collapseAfter?: number
  rows: T[]
  blank: T
  isBlank: (row: T) => boolean
  onChange: (rows: T[]) => void
  render: (
    row: T,
    index: number,
    patch: (patch: Partial<T>) => void,
    lineProps: LineProps,
  ) => ReactNode
}) {
  const containerRef = useRef<HTMLElement>(null)
  const pendingEnterRef = useRef<number | null>(null)
  const committedAtRef = useRef(0)
  const last = rows[rows.length - 1]
  const shown = last !== undefined && isBlank(last) ? rows : [...rows, blank]
  const [expanded, setExpanded] = useState(false)
  const collapsible = collapseAfter != null && rows.length > collapseAfter
  const visible =
    collapsible && !expanded ? shown.slice(0, collapseAfter) : shown

  const focusLine = (index: number) =>
    requestAnimationFrame(() => {
      containerRef.current
        ?.querySelectorAll<LineElement>('[data-line]')
        [index]?.focus()
    })

  const moveNext = (index: number) => {
    if (index >= shown.length - 1) return
    if (index + 1 >= visible.length) setExpanded(true)
    focusLine(index + 1)
  }

  function onLineKeyDown(e: KeyboardEvent<LineElement>, index: number) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (e.nativeEvent.isComposing) {
        pendingEnterRef.current = index
      } else if (Date.now() - committedAtRef.current > 50) {
        moveNext(index)
      }
    } else if (
      e.key === 'Backspace' &&
      !e.nativeEvent.isComposing &&
      e.currentTarget.value === '' &&
      index > 0
    ) {
      e.preventDefault()
      if (index < rows.length) onChange(rows.filter((_, j) => j !== index))
      focusLine(index - 1)
    }
  }

  return (
    <section ref={containerRef} className="review-block" aria-label={title}>
      <h2 className="review-block-title">{title}</h2>
      {visible.map((row, i) => {
        const ghost = i >= rows.length || isBlank(row)
        return (
          <div key={i} className="review-row" data-ghost={ghost || undefined}>
            {render(
              row,
              i,
              (patch) => {
                const base = i < rows.length ? rows : [...rows, blank]
                onChange(base.map((r, j) => (j === i ? { ...r, ...patch } : r)))
              },
              {
                'data-line': true,
                onKeyDown: (e) => onLineKeyDown(e, i),
                onCompositionEnd: () => {
                  if (pendingEnterRef.current !== i) return
                  pendingEnterRef.current = null
                  committedAtRef.current = Date.now()
                  moveNext(i)
                },
              },
            )}
            {!ghost && (
              <button
                type="button"
                className="review-row-del"
                aria-label={`${title} ${i + 1}번 삭제`}
                onClick={() => onChange(rows.filter((_, j) => j !== i))}
              >
                ×
              </button>
            )}
          </div>
        )
      })}
      {collapsible && (
        <button
          type="button"
          className="toc-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? '접기' : `전체 보기 (${rows.length})`}
        </button>
      )}
    </section>
  )
}

const pageOf = (quote: BookQuote) =>
  (quote.page ?? '').replace(/^p\.?\s*/i, '').replace(/\s*쪽$/, '')

const isBlankQuote = (quote: BookQuote) =>
  !quote.text.trim() && !quote.chapter?.trim() && !quote.page?.trim()

export function QuoteSection({
  quotes,
  chapters,
  onChange,
}: {
  quotes: Book['quotes']
  chapters: string[]
  onChange: (quotes: BookQuote[]) => void
}) {
  const chapterListId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const last = quotes[quotes.length - 1]
  const shown =
    last !== undefined && isBlankQuote(last) ? quotes : [...quotes, { text: '' }]

  const patch = (index: number, next: Partial<BookQuote>) => {
    const base = index < quotes.length ? quotes : [...quotes, { text: '' }]
    onChange(base.map((q, i) => (i === index ? { ...q, ...next } : q)))
  }

  const focusCard = (index: number) =>
    requestAnimationFrame(() => {
      wrapRef.current
        ?.querySelectorAll<HTMLTextAreaElement>('.quote-card textarea')
        [index]?.focus()
    })

  return (
    <div ref={wrapRef}>
      <datalist id={chapterListId}>
        {[...new Set(chapters.filter(Boolean))].map((chapter) => (
          <option key={chapter} value={chapter} />
        ))}
      </datalist>
      <QuoteRail className="review-quotes" titleClassName="review-block-title">
        {shown.map((quote, i) => {
          const ghost = i >= quotes.length || isBlankQuote(quote)
          return (
            <div key={i} className="quote-card" data-ghost={ghost || undefined}>
              {!ghost && (
                <button
                  type="button"
                  className="quote-card-del"
                  aria-label={`문장 ${i + 1}번 삭제`}
                  onClick={() => onChange(quotes.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              )}
              <input
                className="quote-chapter"
                list={chapterListId}
                aria-label={`문장 ${i + 1} 목차`}
                placeholder="목차"
                value={quote.chapter ?? ''}
                onChange={(e) => patch(i, { chapter: e.target.value })}
              />
              <textarea
                ref={growTextarea}
                rows={2}
                aria-label={`문장 ${i + 1}`}
                placeholder="마음에 남은 문장"
                value={quote.text}
                onChange={(e) => patch(i, { text: e.target.value })}
                onKeyDown={(e) => {
                  if (
                    e.key !== 'Backspace' ||
                    e.nativeEvent.isComposing ||
                    e.currentTarget.value !== '' ||
                    i === 0 ||
                    i >= quotes.length ||
                    quote.chapter?.trim() ||
                    quote.page?.trim()
                  ) {
                    return
                  }
                  e.preventDefault()
                  onChange(quotes.filter((_, j) => j !== i))
                  focusCard(i - 1)
                }}
              />
              <div className="quote-card-meta">
                <label className="quote-page-field">
                  <span aria-hidden="true">p.</span>
                  <input
                    aria-label={`문장 ${i + 1} 쪽수`}
                    inputMode="numeric"
                    style={{ width: `${Math.max(pageOf(quote).length, 2)}ch` }}
                    value={pageOf(quote)}
                    onChange={(e) => patch(i, { page: e.target.value })}
                  />
                </label>
              </div>
            </div>
          )
        })}
      </QuoteRail>
    </div>
  )
}

export function TocSection({
  toc,
  onChange,
}: {
  toc: Book['toc']
  onChange: (toc: BookTocEntry[]) => void
}) {
  return (
    <ReviewLines
      title="목차"
      collapseAfter={8}
      rows={toc}
      blank={{ title: '' }}
      isBlank={(entry) => !entry.title.trim() && !entry.note?.trim()}
      onChange={onChange}
      render={(entry, i, patch, lineProps) => (
        <div className="review-toc">
          <span aria-hidden="true">{pad(i + 1)}</span>
          <input
            {...lineProps}
            aria-label={`목차 ${i + 1} 제목`}
            placeholder="장 제목"
            value={entry.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
          <input
            className="review-line-sub"
            aria-label={`목차 ${i + 1} 메모`}
            placeholder="메모"
            value={entry.note ?? ''}
            onChange={(e) => patch({ note: e.target.value })}
          />
        </div>
      )}
    />
  )
}
