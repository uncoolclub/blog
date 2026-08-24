import { Node, mergeAttributes } from '@tiptap/core'
import type { DOMOutputSpec } from '@tiptap/pm/model'

export interface EmbedMeta {
  url: string
  title?: string | null
  description?: string | null
  image?: string | null
  siteName?: string | null
}

export function youtubeIdOf(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null
    if (u.hostname === 'youtube.com' || u.hostname.endsWith('.youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v')
      return /^\/(?:shorts|embed|live)\/([\w-]+)/.exec(u.pathname)?.[1] ?? null
    }
  } catch {
    /* URL 아님 */
  }
  return null
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

// 붙여넣은 URL의 리치 프리뷰 블록. OG 메타는 작성 시점에 attrs로 저장되므로
// 읽기 화면은 정적 렌더만으로 카드가 그려진다(방문자 측 외부 요청 없음).
export const Embed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    const attr = (name: string) => ({
      default: null,
      parseHTML: (el: HTMLElement) => el.getAttribute(`data-${name}`),
      renderHTML: (attrs: Record<string, string | null>) =>
        attrs[name] ? { [`data-${name}`]: attrs[name] } : {},
    })
    return {
      url: attr('url'),
      title: attr('title'),
      description: attr('description'),
      image: attr('image'),
      siteName: attr('site-name'),
    }
  },

  parseHTML() {
    return [{ tag: 'figure[data-embed]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const { url, title, description, image, siteName } = node.attrs as {
      [K in keyof EmbedMeta]: string | null
    } & { url: string }
    const ytId = youtubeIdOf(url)

    if (ytId) {
      const children: DOMOutputSpec[] = [
        [
          'div',
          { class: 'embed-frame' },
          [
            'img',
            {
              src: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
              alt: title ?? 'YouTube 영상',
              loading: 'lazy',
            },
          ],
          ['span', { class: 'embed-play' }],
        ],
      ]
      if (title) children.push(['figcaption', {}, title])
      return [
        'figure',
        mergeAttributes(HTMLAttributes, {
          class: 'embed embed-youtube',
          'data-embed': '',
          'data-youtube-id': ytId,
        }),
        ...children,
      ]
    }

    const body: DOMOutputSpec[] = [
      ['strong', { class: 'embed-title' }, title ?? url],
    ]
    if (description) body.push(['p', { class: 'embed-desc' }, description])
    body.push(['span', { class: 'embed-site' }, siteName ?? hostnameOf(url)])

    const children: DOMOutputSpec[] = []
    if (image) {
      children.push([
        'span',
        { class: 'embed-thumb' },
        ['img', { src: image, alt: '', loading: 'lazy' }],
      ])
    }
    children.push(['span', { class: 'embed-body' }, ...body])

    return [
      'figure',
      mergeAttributes(HTMLAttributes, {
        class: 'embed embed-card',
        'data-embed': '',
      }),
      [
        'a',
        { href: url, target: '_blank', rel: 'noopener noreferrer' },
        ...children,
      ],
    ]
  },
})
