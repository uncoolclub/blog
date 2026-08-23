import { WaveGlyph } from './wave'

export function WaveMark({ small, muted }: { small?: boolean; muted?: boolean }) {
  const cls = ['mark', small && 'sm', muted && 'muted'].filter(Boolean).join(' ')
  return (
    <span className={cls} aria-hidden="true">
      <WaveGlyph />
    </span>
  )
}
