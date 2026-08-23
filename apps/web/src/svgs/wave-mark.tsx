import { WaveGlyph } from './wave'

// 로고: 블루 타일 + 흰 파도. muted는 푸터처럼 낮게 깔리는 자리용 회색 변형.
export function WaveMark({ small, muted }: { small?: boolean; muted?: boolean }) {
  const cls = ['mark', small && 'sm', muted && 'muted'].filter(Boolean).join(' ')
  return (
    <span className={cls} aria-hidden="true">
      <WaveGlyph stroke="currentColor" strokeWidth={6} />
    </span>
  )
}
