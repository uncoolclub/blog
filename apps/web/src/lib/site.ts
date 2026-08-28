export const SITE_URL = 'https://blog.th3shu.dev'
export const SITE_NAME = '양수빈 블로그'
export const SITE_DESCRIPTION = '프론트엔드 엔지니어 양수빈의 개발 블로그입니다.'

export const DEFAULT_OG_IMAGE = '/og.png'

export const CF_BEACON_TOKEN = '3ec96ce660d44c83a3f2571526dcad18'

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href
}

export function absolutizeHtml(html: string): string {
  return html.replace(/(src|href)="\/(?!\/)/g, `$1="${SITE_URL}/`)
}

export function toDate(sqlite: string): Date {
  return new Date(sqlite.replace(' ', 'T') + 'Z')
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
