import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LangSwitch } from './LangSwitch'
import { UserMenu } from './UserMenu'

const ENV = (import.meta.env.VITE_TAXCORE_ENV as string | undefined) ?? 'Sandbox'

export function Layout({ children }: { children: ReactNode }) {
  const sandbox = ENV.toLowerCase() === 'sandbox'
  // Companies stays the current section on every company subpage.
  const path = useLocation().pathname
  const companiesActive = path === '/' || path.startsWith('/companies')

  return (
    <div className="rf-root">
      <div className="rf-fluid" aria-hidden="true" />
      {sandbox && <div className="rf-sandbox-strip rf-above-fluid" />}
      <div className="rf-shell rf-above-fluid">
        <aside className="rf-sidebar rf-glass" aria-label="Main navigation">
          <div className="rf-sidebar__brand">Reeforge <span>Finance</span></div>
          <nav>
            <Link to="/" className="rf-nav-item" aria-current={companiesActive ? 'page' : undefined}>Companies</Link>
          </nav>
        </aside>
        <div>
          <header className="rf-topbar">
            <div className="rf-topbar__start" />
            <div className="rf-topbar__end">
              <span
                className={`rf-badge rf-badge--plain ${sandbox ? 'rf-badge--sandbox' : 'rf-badge--production'}`}
                title={sandbox ? 'Sandbox · test invoices, no legal value' : 'Production · invoices have legal value'}
              >
                {ENV}
              </span>
              <LangSwitch />
              <UserMenu />
            </div>
          </header>
          <main className="rf-main">{children}</main>
        </div>
      </div>
    </div>
  )
}
