import type { CSSProperties } from 'react'

// 시그니처 파도 글리프: 앞으로 말리는 파도 + 그 면을 타는 서핑보드. 🏄에서 사람만 뺐다.
// 로고 타일•커버 모티프•파비콘이 전부 이 곡선을 공유한다.
export const WAVE_VIEWBOX = '0 0 64 40'
export const WAVE_CURL = 'M5 32C18 32 20 10 34 10c10 0 14.2 9.5 8.5 14.4'
// 보드: 둥근 테일(좌) + 뾰족한 노즈(우)의 잎사귀형 실루엣. 원점 기준 수평, transform으로 배치.
export const WAVE_BOARD =
  'M-11 0C-11 -2.2 -7 -3 -3 -3 4.5 -3 9.8 -1.1 11.5 0 9.8 1.1 4.5 3 -3 3 -7 3 -11 2.2 -11 0Z'
export const WAVE_BOARD_TRANSFORM = 'translate(50 31.5) rotate(-10)'

export function WaveGlyph({
  stroke = 'currentColor',
  strokeWidth = 5.5,
  style,
}: {
  stroke?: string
  strokeWidth?: number
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox={WAVE_VIEWBOX}
      style={{
        fill: 'none',
        stroke,
        strokeWidth,
        strokeLinecap: 'round',
        ...style,
      }}
      aria-hidden="true"
    >
      <path d={WAVE_CURL} />
      <path
        d={WAVE_BOARD}
        transform={WAVE_BOARD_TRANSFORM}
        style={{ fill: stroke, stroke: 'none' }}
      />
    </svg>
  )
}
