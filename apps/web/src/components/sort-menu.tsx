import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronIcon } from '../svgs'

export interface SortOption<T extends string> {
  value: T
  label: string
}

export function SortMenu<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SortOption<T>[]
  value: T
  onChange: (value: T) => void
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const [active, setActive] = useState(selected)
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open) return
    listRef.current?.focus()
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const show = () => {
    setActive(selected)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const choose = (index: number) => {
    onChange(options[index].value)
    close()
  }

  function onListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    const last = options.length - 1
    if (e.key === 'Tab') {
      setOpen(false)
      return
    }
    const actions: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => (i === last ? 0 : i + 1)),
      ArrowUp: () => setActive((i) => (i === 0 ? last : i - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => choose(active),
      ' ': () => choose(active),
      Escape: close,
    }
    const action = actions[e.key]
    if (!action) return
    e.preventDefault()
    action()
  }

  return (
    <div ref={wrapRef} className="sort-menu">
      <button
        ref={triggerRef}
        type="button"
        className="sort-menu-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={`정렬: ${options[selected].label}`}
        onClick={() => (open ? close() : show())}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
          e.preventDefault()
          show()
        }}
      >
        {options[selected].label}
        <ChevronIcon dir="right" />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={id}
          className="sort-menu-list"
          role="listbox"
          aria-label="정렬"
          aria-activedescendant={`${id}-${active}`}
          tabIndex={-1}
          onKeyDown={onListKeyDown}
        >
          {options.map((option, i) => (
            <li
              key={option.value}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === selected}
              data-active={i === active || undefined}
              onMouseMove={() => setActive(i)}
              onClick={() => choose(i)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
