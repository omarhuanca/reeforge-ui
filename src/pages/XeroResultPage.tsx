import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Brand } from '../components/BrandMark'
import { ThemeToggle } from '../components/ThemeToggle'
import { announceXeroResult } from './xeroChannel'
import { xeroResult } from './xeroResult'

/** Where the accountant lands after the Xero consent. Public: they have no Reeforge account. */
export function XeroResultPage() {
  const [params] = useSearchParams()
  const status = params.get('status')
  const result = xeroResult(status)

  // Opened as the connect pop-up: tell the modal in the app, then close. A plain tab ignores close().
  useEffect(() => {
    announceXeroResult(status)
    const t = window.setTimeout(() => window.close(), 1200)
    return () => window.clearTimeout(t)
  }, [status])

  return (
    <div className="login">
      <div className="row" style={{ position: 'fixed', top: 16, right: 16 }}><ThemeToggle /></div>
      <div className="login__card rf-panel rf-panel__body form">
        <Brand className="login__brand" />
        <h1 style={{ margin: 0 }}>{result.title}</h1>
        <div className={`rf-alert rf-alert--${result.ok ? 'success' : 'danger'}`} role={result.ok ? 'status' : 'alert'}>
          <div>{result.text}</div>
        </div>
      </div>
    </div>
  )
}
