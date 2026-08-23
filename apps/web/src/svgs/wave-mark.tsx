export function WaveMark({ small }: { small?: boolean }) {
  return <span className={small ? 'mark sm' : 'mark'} aria-hidden="true" />
}
