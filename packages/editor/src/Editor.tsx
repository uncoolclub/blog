import type { JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import type { EmbedMeta } from './embed'
import { editorExtensions } from './extensions'
import { imageFromDataTransfer } from './image'
import { Toolbar } from './Toolbar'

export interface EditorProps {
  initialContent?: JSONContent | null
  placeholder?: string
  onChange: (content: JSONContent) => void
  uploadImage?: (file: File) => Promise<string>
  unfurl?: (url: string) => Promise<Partial<EmbedMeta>>
}

const BARE_URL = /^https?:\/\/\S+$/

export function Editor({
  initialContent,
  placeholder,
  onChange,
  uploadImage,
  unfurl,
}: EditorProps) {
  const editor = useEditor({
    extensions: editorExtensions({ placeholder }),
    content: initialContent ?? undefined,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      handlePaste: (view, event) => {
        // 빈 문단에 URL만 붙여넣으면 임베드로. 본문 중간이면 기존 링크 동작 유지.
        const text = event.clipboardData?.getData('text/plain').trim() ?? ''
        const { $from, empty } = view.state.selection
        if (
          unfurl &&
          BARE_URL.test(text) &&
          empty &&
          $from.parent.isTextblock &&
          $from.parent.content.size === 0
        ) {
          void insertEmbed(text)
          return true
        }
        return insertFrom(event.clipboardData)
      },
      handleDrop: (_view, event) => {
        const handled = insertFrom(event.dataTransfer)
        if (handled) event.preventDefault()
        return handled
      },
    },
  })

  function insertFrom(data: DataTransfer | null): boolean {
    if (!uploadImage) return false
    const file = imageFromDataTransfer(data)
    if (!file) return false
    void insertImage(file)
    return true
  }

  async function insertImage(file: File) {
    if (!editor || !uploadImage) return
    const src = await uploadImage(file)
    editor.chain().focus().setImage({ src }).run()
  }

  async function insertEmbed(url: string) {
    if (!editor || !unfurl) return
    editor.chain().focus().insertContent({ type: 'embed', attrs: { url } }).run()
    let meta: Partial<EmbedMeta>
    try {
      meta = await unfurl(url)
    } catch {
      return // 메타 없이도 URL 카드로 렌더되므로 실패는 무시
    }
    editor.commands.command(({ tr, state }) => {
      state.doc.descendants((node, pos) => {
        if (
          node.type.name === 'embed' &&
          node.attrs.url === url &&
          !node.attrs.title
        ) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...meta })
        }
      })
      return true
    })
  }

  return (
    <div className="blog-editor">
      {editor && (
        <Toolbar
          editor={editor}
          onPickImage={uploadImage ? insertImage : undefined}
        />
      )}
      <EditorContent editor={editor} className="prose" />
    </div>
  )
}
