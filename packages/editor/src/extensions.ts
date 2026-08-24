import type { Extensions } from '@tiptap/core'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import { Embed } from './embed'

export const lowlight = createLowlight(common)

// pre에 data-language를 남겨 CSS(::before)로 언어 라벨을 띄운다.
const BlogCodeBlock = CodeBlockLowlight.extend({
  addAttributes() {
    const parent = (this.parent?.() ?? {}) as Record<string, object>
    return {
      ...parent,
      language: {
        ...parent.language,
        rendered: true,
        renderHTML: (attrs: { language: string | null }) =>
          attrs.language ? { 'data-language': attrs.language } : {},
      },
    }
  },
}).configure({ lowlight })

// width(%)와 align(left·center·right)을 속성으로 갖는 이미지.
// 조작 UI는 툴바(이미지 선택 시 노출), 표시는 .prose CSS가 담당한다.
const BlogImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          const m = /^(\d+(?:\.\d+)?)%$/.exec(el.style.width)
          return m ? Number(m[1]) : null
        },
        renderHTML: (attrs: { width: number | null }) =>
          attrs.width ? { style: `width: ${attrs.width}%` } : {},
      },
      align: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-align'),
        renderHTML: (attrs: { align: string | null }) =>
          attrs.align ? { 'data-align': attrs.align } : {},
      },
    }
  },
})

export function baseExtensions(): Extensions {
  return [
    StarterKit.configure({
      codeBlock: false,
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      },
    }),
    BlogCodeBlock,
    BlogImage,
    Embed,
  ]
}

export function editorExtensions(opts?: { placeholder?: string }): Extensions {
  return [
    ...baseExtensions(),
    Placeholder.configure({
      placeholder: opts?.placeholder ?? '내용을 입력하세요…',
    }),
  ]
}
