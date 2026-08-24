import { BOOK_COVERS } from '../svgs/covers'
import type { BookSummary } from '../server/posts'

const SOLID = 'M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6z'
const OUTLINE =
  'M8 2.4l1.7 3.4 3.8.5-2.7 2.7.6 3.8L8 11l-3.4 1.8.6-3.8-2.7-2.7 3.8-.5z'

export function StarGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="star-solid">
      <path d={SOLID} />
    </svg>
  )
}

// 0.5 단위 별점. 반 별은 채운 별을 폭 50%로 잘라 빈 별 위에 겹친다.
export function StarRating({ rating }: { rating: number }) {
  return (
    <span className="stars" role="img" aria-label={`별점 ${rating} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - i))
        return (
          <span key={i} className="star">
            <svg viewBox="0 0 16 16" className="star-outline">
              <path d={OUTLINE} />
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
    return <img className="book-cover" src={book.coverUrl} alt="" />
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
