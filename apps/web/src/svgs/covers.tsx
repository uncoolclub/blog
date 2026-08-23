import type { CSSProperties } from 'react'
import { WaveGlyph } from './wave'

// 커버 모티프: 커버 이미지 필드가 생기기 전까지 글 id 기반으로 순환하는 잔잔한 일러스트.
// 전부 64×40 뷰박스와 같은 획 언어(라운드 캡)를 공유한다.
const VB = '0 0 64 40'

const stroked = (ink: string, sw = 5): CSSProperties => ({
  fill: 'none',
  stroke: ink,
  strokeWidth: sw,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

function Doc({ ink, style }: MotifProps) {
  return (
    <svg viewBox={VB} style={{ ...stroked(ink), ...style }}>
      <rect x="16" y="3" width="32" height="34" rx="6" />
      <path d="M24 13h16M24 20h16M24 27h9" />
    </svg>
  )
}

function Chart({ ink, style }: MotifProps) {
  return (
    <svg viewBox={VB} style={{ ...stroked(ink), ...style }}>
      <path d="M7 33 23 17l8 8L47 9" />
      <circle cx="55" cy="7" r="3.5" style={{ fill: ink, stroke: 'none' }} />
    </svg>
  )
}

function Swatches({ ink, style }: MotifProps) {
  return (
    <svg viewBox={VB} style={{ fill: ink, ...style }}>
      <rect x="10" y="15" width="20" height="20" rx="5" opacity="0.3" />
      <rect x="21" y="9.5" width="20" height="20" rx="5" opacity="0.55" />
      <rect x="32" y="4" width="20" height="20" rx="5" />
    </svg>
  )
}

function Keycap({ ink, style }: MotifProps) {
  return (
    <svg viewBox={VB} style={{ ...stroked(ink), ...style }}>
      <rect x="17" y="3" width="30" height="30" rx="8" />
      <rect x="24" y="10" width="16" height="16" rx="5" />
    </svg>
  )
}

function Brackets({ ink, style }: MotifProps) {
  return (
    <svg viewBox={VB} style={{ ...stroked(ink, 5.5), ...style }}>
      <path d="M23 8 12 20l11 12M41 8l11 12-11 12" />
    </svg>
  )
}

function Cursor({ ink, style }: MotifProps) {
  return (
    <svg viewBox={VB} style={{ fill: ink, ...style }}>
      <path d="M25 4v25l7-6 4.5 10 5.5-2.4L37.5 21H46z" />
    </svg>
  )
}

interface MotifProps {
  ink: string
  style?: CSSProperties
}

export const COVERS = [
  {
    bg: 'linear-gradient(135deg, #e6ecff 0%, #c9d6ff 100%)',
    ink: '#1342ff',
    Motif: ({ ink, style }: MotifProps) => (
      <WaveGlyph stroke={ink} strokeWidth={7} style={style} />
    ),
  },
  {
    bg: 'linear-gradient(135deg, #f1efe9 0%, #e6e2d6 100%)',
    ink: '#6b6b73',
    Motif: Doc,
  },
  {
    bg: 'linear-gradient(135deg, #e9f2ec 0%, #d9e8de 100%)',
    ink: '#4d7a5f',
    Motif: Chart,
  },
  {
    bg: 'linear-gradient(135deg, #efe9f6 0%, #e2d8ef 100%)',
    ink: '#7a5c9e',
    Motif: Swatches,
  },
  {
    bg: 'linear-gradient(135deg, #f6efe2 0%, #eee0c8 100%)',
    ink: '#a37b2c',
    Motif: Keycap,
  },
  {
    bg: 'linear-gradient(135deg, #f7eaea 0%, #efd9d9 100%)',
    ink: '#a05656',
    Motif: Brackets,
  },
  {
    bg: 'linear-gradient(135deg, #e9eef2 0%, #d8e2e9 100%)',
    ink: '#52697a',
    Motif: Cursor,
  },
] as const
