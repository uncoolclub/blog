import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { lowlight } from './extensions'

const LANGUAGES = lowlight.listLanguages().sort()

const IMAGE_ALIGNS = [
  { value: 'left', label: 'L', title: '왼쪽 정렬' },
  { value: 'center', label: 'C', title: '가운데 정렬' },
  { value: 'right', label: 'R', title: '오른쪽 정렬' },
] as const

const IMAGE_WIDTHS = [
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: null, label: '100%' },
] as const

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
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      active: BUTTONS.map((b) => b.isActive?.(editor) ?? false),
      codeLang: editor.isActive('codeBlock')
        ? ((editor.getAttributes('codeBlock').language as string | null) ??
          'auto')
        : null,
      image: editor.isActive('image')
        ? {
            align: (editor.getAttributes('image').align as string | null) ?? null,
            width: (editor.getAttributes('image').width as number | null) ?? null,
            alt: (editor.getAttributes('image').alt as string | null) ?? '',
          }
        : null,
    }),
  })

  return (
    <div className="blog-editor-toolbar" role="toolbar" aria-label="서식">
      {BUTTONS.map((b, i) => (
        <button
          key={b.label}
          type="button"
          title={b.title}
          aria-label={b.title}
          aria-pressed={state.active[i]}
          data-active={state.active[i] || undefined}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => b.toggle(editor)}
        >
          {b.label}
        </button>
      ))}
      {onPickImage && <ImagePicker onPick={onPickImage} />}
      {state.codeLang !== null && (
        <select
          className="blog-editor-lang"
          title="코드 언어"
          aria-label="코드 언어"
          value={state.codeLang}
          onChange={(e) =>
            editor
              .chain()
              .focus()
              .updateAttributes('codeBlock', {
                language: e.target.value === 'auto' ? null : e.target.value,
              })
              .run()
          }
        >
          <option value="auto">자동</option>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      )}
      {state.image && (
        <>
          {IMAGE_ALIGNS.map((a) => (
            <button
              key={a.value}
              type="button"
              title={a.title}
              aria-label={a.title}
              aria-pressed={state.image?.align === a.value}
              data-active={state.image?.align === a.value || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .updateAttributes('image', {
                    align: state.image?.align === a.value ? null : a.value,
                  })
                  .run()
              }
            >
              {a.label}
            </button>
          ))}
          {IMAGE_WIDTHS.map((w) => (
            <button
              key={w.label}
              type="button"
              title={`너비 ${w.label}`}
              aria-label={`너비 ${w.label}`}
              aria-pressed={state.image?.width === w.value}
              data-active={state.image?.width === w.value || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .updateAttributes('image', { width: w.value })
                  .run()
              }
            >
              {w.label}
            </button>
          ))}
          <input
            className="blog-editor-alt"
            type="text"
            placeholder="대체 텍스트"
            title="대체 텍스트"
            aria-label="대체 텍스트"
            value={state.image.alt}
            onChange={(e) =>
              editor.commands.updateAttributes('image', {
                alt: e.target.value || null,
              })
            }
          />
        </>
      )}
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
