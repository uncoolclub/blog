import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import type { Editor as TiptapEditor } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'
import { editorExtensions } from './extensions'

export interface EditorProps {
  initialContent?: JSONContent | null
  placeholder?: string
  onChange: (content: JSONContent) => void
  /** 파일을 업로드하고 img src로 쓸 URL을 돌려준다. 없으면 이미지 기능 비활성. */
  uploadImage?: (file: File) => Promise<string>
}

export function Editor({
  initialContent,
  placeholder,
  onChange,
  uploadImage,
}: EditorProps) {
  const editor = useEditor({
    extensions: editorExtensions({ placeholder }),
    content: initialContent ?? undefined,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      handlePaste: (_view, event) => {
        if (!uploadImage) return false
        const file = [...(event.clipboardData?.files ?? [])].find((f) =>
          f.type.startsWith('image/'),
        )
        if (!file) return false
        void insertImage(file)
        return true
      },
      handleDrop: (_view, event) => {
        if (!uploadImage) return false
        const file = [...(event.dataTransfer?.files ?? [])].find((f) =>
          f.type.startsWith('image/'),
        )
        if (!file) return false
        event.preventDefault()
        void insertImage(file)
        return true
      },
    },
  })

  async function insertImage(file: File) {
    if (!editor || !uploadImage) return
    const src = await uploadImage(file)
    editor.chain().focus().setImage({ src }).run()
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

function Toolbar({
  editor,
  onPickImage,
}: {
  editor: TiptapEditor
  onPickImage?: (file: File) => void
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      strike: editor.isActive('strike'),
      code: editor.isActive('code'),
      h1: editor.isActive('heading', { level: 1 }),
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      blockquote: editor.isActive('blockquote'),
      codeBlock: editor.isActive('codeBlock'),
    }),
  })

  const chain = () => editor.chain().focus()

  const buttons: Array<{
    label: string
    active?: boolean
    run: () => void
    title: string
  }> = [
    { label: 'H1', active: state.h1, title: '제목 1', run: () => chain().toggleHeading({ level: 1 }).run() },
    { label: 'H2', active: state.h2, title: '제목 2', run: () => chain().toggleHeading({ level: 2 }).run() },
    { label: 'H3', active: state.h3, title: '제목 3', run: () => chain().toggleHeading({ level: 3 }).run() },
    { label: 'B', active: state.bold, title: '굵게', run: () => chain().toggleBold().run() },
    { label: 'I', active: state.italic, title: '기울임', run: () => chain().toggleItalic().run() },
    { label: 'S', active: state.strike, title: '취소선', run: () => chain().toggleStrike().run() },
    { label: '<>', active: state.code, title: '인라인 코드', run: () => chain().toggleCode().run() },
    { label: '•', active: state.bulletList, title: '글머리 목록', run: () => chain().toggleBulletList().run() },
    { label: '1.', active: state.orderedList, title: '번호 목록', run: () => chain().toggleOrderedList().run() },
    { label: '❝', active: state.blockquote, title: '인용', run: () => chain().toggleBlockquote().run() },
    { label: '{ }', active: state.codeBlock, title: '코드 블록', run: () => chain().toggleCodeBlock().run() },
    { label: '―', title: '구분선', run: () => chain().setHorizontalRule().run() },
  ]

  return (
    <div className="blog-editor-toolbar" role="toolbar" aria-label="서식">
      {buttons.map((b) => (
        <button
          key={b.label}
          type="button"
          title={b.title}
          aria-label={b.title}
          aria-pressed={b.active}
          data-active={b.active || undefined}
          onMouseDown={(e) => e.preventDefault()}
          onClick={b.run}
        >
          {b.label}
        </button>
      ))}
      {onPickImage && (
        <label className="blog-editor-image-button" title="이미지">
          🖼
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onPickImage(file)
              e.target.value = ''
            }}
          />
        </label>
      )}
    </div>
  )
}
