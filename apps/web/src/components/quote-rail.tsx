import { Children, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronIcon } from '../svgs'

const QUOTE_LIMIT = 150

export function QuoteText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const chars = Array.from(text)
  const long = chars.length > QUOTE_LIMIT
  const shown =
    long && !expanded
      ? `${chars.slice(0, QUOTE_LIMIT).join('').trimEnd()}…`
      : text

  return (
    <blockquote>
      {shown}
      {long && (
        <button
          type="button"
          className="quote-more"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? '접기' : '더 보기'}
        </button>
      )}
    </blockquote>
  )
}

export function QuoteRail({
  className = '',
  titleClassName = 'review-section',
  children,
}: {
  className?: string
  titleClassName?: string
  children: ReactNode
}) {
  const railRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const total = Children.count(children)
  const current = Math.min(active, total - 1)

  const syncActive = () => {
    const rail = railRef.current
    if (!rail || rail.children.length === 0) return
    if (rail.scrollLeft > 0 && rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2) {
      setActive(rail.children.length - 1)
      return
    }
    const cards = Array.from(rail.children) as HTMLElement[]
    const origin = cards[0].offsetLeft
    let nearest = 0
    cards.forEach((card, i) => {
      const distance = Math.abs(card.offsetLeft - origin - rail.scrollLeft)
      const best = Math.abs(cards[nearest].offsetLeft - origin - rail.scrollLeft)
      if (distance < best) nearest = i
    })
    setActive(nearest)
  }

  useEffect(syncActive, [total])

  const goTo = (index: number) => {
    const rail = railRef.current
    if (!rail) return
    const cards = Array.from(rail.children) as HTMLElement[]
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rail.scrollTo({
      left: cards[index].offsetLeft - cards[0].offsetLeft,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  return (
    <section className={`quotes ${className}`.trim()}>
      <div className="quotes-head">
        <h2 className={titleClassName}>문장 수집</h2>
        {total > 1 && (
          <div className="quote-controls">
            <span aria-live="polite">
              {current + 1} / {total}
            </span>
            <button
              type="button"
              aria-label="이전 문장"
              disabled={current === 0}
              onClick={() => goTo(current - 1)}
            >
              <ChevronIcon dir="left" />
            </button>
            <button
              type="button"
              aria-label="다음 문장"
              disabled={current === total - 1}
              onClick={() => goTo(current + 1)}
            >
              <ChevronIcon dir="right" />
            </button>
          </div>
        )}
      </div>
      <div
        ref={railRef}
        className="quote-rail"
        role="region"
        aria-label="수집한 문장"
        tabIndex={0}
        onScroll={syncActive}
      >
        {children}
      </div>
    </section>
  )
}
