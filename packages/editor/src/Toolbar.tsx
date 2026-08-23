import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'

interface ToolbarButton {
  label: string
  title: string
  isActive?: (editor: Editor) => boolean
  toggle: (editor: Editor) => void
}

const BUTTONS: ToolbarButton[] = [
  {
    label: 'H1',
    title: '제목 1',
    isActive: (e) => e.isActive('heading', { level: 1 }),
    toggle: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: 'H2',
    title: '제목 2',
    isActive: (e) => e.isActive('heading', { level: 2 }),
    toggle: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'H3',
    title: '제목 3',
    isActive: (e) => e.isActive('heading', { level: 3 }),
    toggle: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: 'B',
    title: '굵게',
    isActive: (e) => e.isActive('bold'),
    toggle: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    label: 'I',
    title: '기울임',
    isActive: (e) => e.isActive('italic'),
    toggle: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    label: 'S',
    title: '취소선',
    isActive: (e) => e.isActive('strike'),
    toggle: (e) => e.chain().focus().toggleStrike().run(),
  },
  {
    label: '<>',
    title: '인라인 코드',
    isActive: (e) => e.isActive('code'),
    toggle: (e) => e.chain().focus().toggleCode().run(),
  },
  {
    label: '•',
    title: '글머리 목록',
    isActive: (e) => e.isActive('bulletList'),
    toggle: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: '1.',
    title: '번호 목록',
    isActive: (e) => e.isActive('orderedList'),
    toggle: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    label: '❝',
    title: '인용',
    isActive: (e) => e.isActive('blockquote'),
    toggle: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    label: '{ }',
    title: '코드 블록',
    isActive: (e) => e.isActive('codeBlock'),
    toggle: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: '―',
    title: '구분선',
    toggle: (e) => e.chain().focus().setHorizontalRule().run(),
  },
]

export function Toolbar({
  editor,
  onPickImage,
}: {
  editor: Editor
  onPickImage?: (file: File) => void
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor }) => BUTTONS.map((b) => b.isActive?.(editor) ?? false),
  })

  return (
    <div className="blog-editor-toolbar" role="toolbar" aria-label="서식">
      {BUTTONS.map((b, i) => (
        <button
          key={b.label}
          type="button"
          title={b.title}
          aria-label={b.title}
          aria-pressed={active[i]}
          data-active={active[i] || undefined}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => b.toggle(editor)}
        >
          {b.label}
        </button>
      ))}
      {onPickImage && <ImagePicker onPick={onPickImage} />}
    </div>
  )
}

function ImagePicker({ onPick }: { onPick: (file: File) => void }) {
  return (
    <label className="blog-editor-image-button" title="이미지" aria-label="이미지">
      <svg viewBox="0 0 16 16">
        <rect x="1.5" y="2.5" width="13" height="11" rx="2" />
        <circle cx="5.4" cy="6" r="1.2" data-fill="true" />
        <path d="m2.5 12.5 3.5-4 3 3 2-2 2.5 3" />
      </svg>
      <input
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPick(file)
          e.target.value = ''
        }}
      />
    </label>
  )
}
