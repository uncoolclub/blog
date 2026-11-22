import { useEffect, useRef, useState } from 'react'
import { BOOK_COVERS } from '../svgs/covers'
import type { BookSummary } from '../server/posts'

export const STAR_SOLID = 'M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6z'
export const STAR_OUTLINE =
  'M8 2.4l1.7 3.4 3.8.5-2.7 2.7.6 3.8L8 11l-3.4 1.8.6-3.8-2.7-2.7 3.8-.5z'

export function StarGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="star-solid">
      <path d={STAR_SOLID} />
    </svg>
  )
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <span className="stars" role="img" aria-label={`별점 ${rating} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - i))
        return (
          <span key={i} className="star">
            <svg viewBox="0 0 16 16" className="star-outline">
              <path d={STAR_OUTLINE} />
            </svg>
            {fill > 0 && (
              <span className="star-fill" style={{ width: `${fill * 100}%` }}>
                <StarGlyph />
              </span>
            )}
          </span>
        )
      })}
      <span className="star-score">{rating.toFixed(1)}</span>
    </span>
  )
}

export function CoverImage({
  src,
  fallback,
  className,
  loading,
}: {
  src: string
  fallback?: string
  className: string
  loading?: 'lazy' | 'eager'
}) {
  const ref = useRef<HTMLImageElement>(null)
  const [failedSrc, setFailedSrc] = useState<string>()

  useEffect(() => {
    const img = ref.current
    if (img?.complete && img.naturalWidth === 0) setFailedSrc(src)
  }, [src])

  return (
    <img
      ref={ref}
      className={className}
      src={failedSrc === src && fallback ? fallback : src}
      alt=""
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
    />
  )
}

export function BookCover({
  id,
  book,
  showAuthor,
}: {
  id: number
  book: BookSummary
  showAuthor?: boolean
}) {
  if (book.coverUrl) {
    return (
      <CoverImage
        className="book-cover"
        src={book.coverUrl}
        fallback={book.coverFallbackUrl}
      />
    )
  }
  return (
    <div
      className="book-cover"
      style={{ background: BOOK_COVERS[id % BOOK_COVERS.length] }}
      aria-hidden="true"
    >
      <span className="book-cover-title">{book.title}</span>
      {showAuthor && <span className="book-cover-author">{book.author}</span>}
    </div>
  )
}
