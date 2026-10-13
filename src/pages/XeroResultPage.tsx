import { useSearchParams } from 'react-router-dom'
import { Brand } from '../components/BrandMark'
import { ThemeToggle } from '../components/ThemeToggle'
import { xeroResult } from './xeroResult'

/** Where the accountant lands after the Xero consent. Public: they have no Reeforge account. */
export function XeroResultPage() {
  const [params] = useSearchParams()
  const result = xeroResult(params.get('status'))

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
