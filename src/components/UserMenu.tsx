import { useEffect, useId, useRef, useState } from 'react'
import { useAuth } from '../authContext'
import { useTheme } from '../theme'

/** Avatar button with a popover: theme and sign out live here, not loose in the top bar. */
export function UserMenu() {
  const { signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="user-menu" ref={root}>
      <button
        className="rf-avatar user-menu__trigger"
        aria-label="User menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        title="Admin"
        onClick={() => setOpen((v) => !v)}
      >
        AD
      </button>
      {open && (
        <div className="user-menu__panel" id={menuId} role="menu">
          <div className="user-menu__who rf-sm">Signed in as <strong>Admin</strong></div>
          <button role="menuitem" className="user-menu__item" onClick={toggle}>
            {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
          </button>
          <button role="menuitem" className="user-menu__item" onClick={() => { setOpen(false); void signOut() }}>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
