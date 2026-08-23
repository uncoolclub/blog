import type { JSONContent } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import { editorExtensions } from './extensions'
import { imageFromDataTransfer } from './image'
import { Toolbar } from './Toolbar'

export interface EditorProps {
  initialContent?: JSONContent | null
  placeholder?: string
  onChange: (content: JSONContent) => void
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
      handlePaste: (_view, event) => insertFrom(event.clipboardData),
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
