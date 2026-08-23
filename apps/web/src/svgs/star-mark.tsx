export const STAR_PATH =
  'M28.4 2.2L34.3 23.8L47.4 12.3L39.4 27.8L60.8 28.5L40.2 34.3L50.9 46.8L36.2 39.4L35.6 61.8L29.7 40.2L16.6 51.7L24.6 36.2L4.2 35.4L23.8 29.7L13.1 17.2L27.8 24.6Z'

export function StarMark({ small }: { small?: boolean }) {
  return (
    <span className={small ? 'mark sm' : 'mark'} aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <path d={STAR_PATH} fill="var(--accent)" />
      </svg>
    </span>
  )
}
