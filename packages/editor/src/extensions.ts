import type { Extensions } from '@tiptap/core'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'

export const lowlight = createLowlight(common)

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
    CodeBlockLowlight.configure({ lowlight }),
    Image,
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
