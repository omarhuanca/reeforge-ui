import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

/** Popover menu (rf-menu-wrap + rf-menu): opens below, closes on outside click and Esc. */
export function Menu({
  label,
  buttonClass,
  trigger,
  children,
}: {
  label: string
  buttonClass: string
  trigger: ReactNode
  children: (close: () => void) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="rf-menu-wrap" ref={root}>
      <button
        ref={button}
        type="button"
        className={buttonClass}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>
      {open && (
        <div className="rf-menu" id={menuId} role="menu">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
