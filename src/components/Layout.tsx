import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../authContext'

const ENV = (import.meta.env.VITE_TAXCORE_ENV as string | undefined) ?? 'Sandbox'

export function Layout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()
  const sandbox = ENV.toLowerCase() === 'sandbox'
  return (
    <div className="rf-root">
      <div className="rf-fluid" aria-hidden="true" />
      {sandbox && <div className="rf-sandbox-strip" />}
      <div className="rf-shell rf-above-fluid">
        <aside className="rf-sidebar rf-glass">
          <div className="rf-sidebar__brand">Reeforge · Finance</div>
          <nav>
            <NavLink to="/" end className="rf-nav-item">
              Companies
            </NavLink>
          </nav>
        </aside>
        <div>
          <header className="rf-topbar rf-glass">
            <div className="rf-topbar__start" />
            <div className="rf-topbar__end">
              <span className={`rf-badge ${sandbox ? 'rf-badge--sandbox' : 'rf-badge--production'}`}>{ENV}</span>
              <button className="rf-btn rf-btn--ghost rf-btn--sm" onClick={signOut}>
                Sign out
              </button>
            </div>
          </header>
          <main className="rf-main">{children}</main>
        </div>
      </div>
    </div>
  )
}
