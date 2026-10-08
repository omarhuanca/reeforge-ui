import { useEffect, useId, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { IconMenu } from './icons'
import { LangSwitch } from './LangSwitch'
import { UserMenu } from './UserMenu'

const ENV = (import.meta.env.VITE_TAXCORE_ENV as string | undefined) ?? 'Sandbox'

export function Layout({ children }: { children: ReactNode }) {
  const sandbox = ENV.toLowerCase() === 'sandbox'
  // Companies stays the current section on every company subpage.
  const path = useLocation().pathname
  const companiesActive = path === '/' || path.startsWith('/companies')

  // Under 900px the sidebar is a drawer: Esc, a tap outside, or choosing an item closes it.
  const [drawer, setDrawer] = useState(false)
  const sidebarId = useId()
  useEffect(() => {
    if (!drawer) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawer])

  return (
    <div className="rf-root">
      <div className="rf-fluid" aria-hidden="true" />
      {sandbox && <div className="rf-sandbox-strip rf-above-fluid" />}
      <div className="rf-shell rf-above-fluid">
        <aside id={sidebarId} className="rf-sidebar" data-open={drawer} aria-label="Main navigation">
          <div className="rf-sidebar__brand">Reeforge <span>Finance</span></div>
          <nav>
            <Link to="/" className="rf-nav-item" aria-current={companiesActive ? 'page' : undefined} onClick={() => setDrawer(false)}>
              Companies
            </Link>
          </nav>
        </aside>
        <div className="rf-drawer-backdrop" onClick={() => setDrawer(false)} />
        <div>
          <header className="rf-topbar">
            <div className="rf-topbar__start">
              <button
                type="button"
                className="rf-btn rf-btn--ghost rf-icon-btn rf-menu-btn"
                aria-label="Open menu"
                aria-controls={sidebarId}
                aria-expanded={drawer}
                onClick={() => setDrawer((v) => !v)}
              >
                <IconMenu />
              </button>
            </div>
            <div className="rf-topbar__end">
              <span
                className={`rf-badge rf-badge--plain ${sandbox ? 'rf-badge--sandbox' : 'rf-badge--production'}`}
                title={sandbox ? 'Sandbox · test invoices, no legal value' : 'Production · invoices have legal value'}
              >
                {ENV}
              </span>
              <LangSwitch className="rf-hide-mobile" />
              <UserMenu />
            </div>
          </header>
          <main className="rf-main">{children}</main>
        </div>
      </div>
    </div>
  )
}
