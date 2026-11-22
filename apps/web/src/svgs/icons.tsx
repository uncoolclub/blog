import type { CSSProperties } from 'react'

const stroked: CSSProperties = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const fine: CSSProperties = { ...stroked, strokeWidth: 0.95 }

export function DocIcon() {
  return (
    <svg viewBox="0 0 16 16" style={fine}>
      <path d="M4.6 1.9h4.7l3.1 3.1v8.1c0 .6-.4 1-1 1H4.6c-.6 0-1-.4-1-1V2.9c0-.6.4-1 1-1Z" />
      <path d="M9.1 2v3.2h3.2M5.9 8.3h4.2M5.9 10.9h4.2" />
    </svg>
  )
}

export function UserIcon() {
  return (
    <svg viewBox="0 0 16 16" style={fine}>
      <circle cx="8" cy="5.2" r="2.7" />
      <path d="M2.9 13.8c.5-2.6 2.6-4.2 5.1-4.2s4.6 1.6 5.1 4.2" />
    </svg>
  )
}

export function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" style={fine}>
      <rect x="2.2" y="3.2" width="11.6" height="10.6" rx="1.8" />
      <path d="M2.2 6.6h11.6M5.3 1.9v2.4M10.7 1.9v2.4" />
    </svg>
  )
}

export function EditIcon() {
  return (
    <svg viewBox="0 0 16 16" style={fine}>
      <path d="M10.7 2.9a1.5 1.5 0 0 1 2.2 2.1l-7.6 7.6-3 .9.9-3Z" />
      <path d="m9.5 4.1 2.2 2.2" />
    </svg>
  )
}

export function MoreIcon() {
  return (
    <svg viewBox="0 0 16 16" style={{ fill: 'currentColor', stroke: 'none' }}>
      <circle cx="3.5" cy="8" r="1" />
      <circle cx="8" cy="8" r="1" />
      <circle cx="12.5" cy="8" r="1" />
    </svg>
  )
}

export function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" style={fine}>
      <path d="M9.8 3.5 5.3 8l4.5 4.5" />
    </svg>
  )
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" style={fine}>
      <path d="M2.8 4.3h10.4M6.2 4.3V2.9c0-.4.3-.7.7-.7h2.2c.4 0 .7.3.7.7v1.4M4 4.3l.6 8.4c0 .6.5 1.1 1.1 1.1h4.6c.6 0 1.1-.5 1.1-1.1l.6-8.4M6.8 7v4M9.2 7v4" />
    </svg>
  )
}

export function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" style={{ fill: 'currentColor' }}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

export function RssIcon() {
  return (
    <svg viewBox="0 0 16 16" style={{ ...stroked, strokeWidth: 1.8 }}>
      <path d="M2 2.6a11.4 11.4 0 0 1 11.4 11.4M2 7.4a6.6 6.6 0 0 1 6.6 6.6" />
      <circle
        cx="3.4"
        cy="12.6"
        r="1.6"
        style={{ fill: 'currentColor', stroke: 'none' }}
      />
    </svg>
  )
}

export function MailIcon() {
  return (
    <svg viewBox="0 0 16 16" style={{ ...stroked, strokeWidth: 1.5 }}>
      <rect x="1.4" y="3" width="13.2" height="10" rx="1.6" />
      <path d="m2.2 4.2 5.8 4.6 5.8-4.6" />
    </svg>
  )
}

export function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" className="sun" style={fine}>
      <circle cx="8" cy="8" r="2.8" />
      <path d="M8 1.6v1.3M8 13.1v1.3M1.6 8h1.3M13.1 8h1.3M3.5 3.5l.9.9M11.6 11.6l.9.9M12.5 3.5l-.9.9M4.4 11.6l-.9.9" />
    </svg>
  )
}

export function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" className="moon" style={fine}>
      <path d="M13.5 9.7A5.8 5.8 0 1 1 6.3 2.5a4.7 4.7 0 0 0 7.2 7.2Z" />
    </svg>
  )
}

export function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" style={{ ...stroked, strokeWidth: 1.8 }}>
      <path d={dir === 'left' ? 'M10.5 2.5 5 8l5.5 5.5' : 'M5.5 2.5 11 8l-5.5 5.5'} />
    </svg>
  )
}

// 프로필 사진이 생기기 전까지의 자리 표시 얼굴
export function FaceSketch() {
  return (
    <svg
      viewBox="0 0 48 48"
      style={{ ...stroked, stroke: '#c47a55', strokeWidth: 2.4 }}
    >
      <circle cx="18" cy="20" r="1.6" style={{ fill: '#c47a55', stroke: 'none' }} />
      <circle cx="30" cy="20" r="1.6" style={{ fill: '#c47a55', stroke: 'none' }} />
      <path d="M17 28c2.4 2.8 11.6 2.8 14 0" />
      <path d="M10 15c1-6 7-9 14-9s13 3 14 9" />
    </svg>
  )
}
