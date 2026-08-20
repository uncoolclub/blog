import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { common, createLowlight } from 'lowlight'
import type { Extensions } from '@tiptap/core'

export const lowlight = createLowlight(common)

// 스키마의 단일 정본. Editor와 Renderer(generateHTML)가 반드시 같은 세트를 쓴다.
// 여기서 어긋나면 에디터에서 보이는 것과 발행 글이 달라진다.
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
