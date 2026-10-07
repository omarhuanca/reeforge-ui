import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useCompany } from '../api/hooks'
import { ErrorAlert, Skeleton } from '../components/ui'
import { CompanyForm } from './CompaniesPage'
import { InvoicesTab } from './InvoicesTab'
import { CertificatesTab } from './CertificatesTab'
import { XeroTab } from './XeroTab'

const TABS = ['invoices', 'certificates', 'xero'] as const
type Tab = (typeof TABS)[number]
const LABEL: Record<Tab, string> = { invoices: 'Invoices', certificates: 'Certificates', xero: 'Xero' }

export function CompanyPage() {
  const id = Number(useParams().id)
  const q = useCompany(id)
  const requested = useSearchParams()[0].get('tab')
  const [tab, setTab] = useState<Tab>(TABS.find((t) => t === requested) ?? 'invoices')
  const [renaming, setRenaming] = useState(false)

  if (q.isLoading) return <Skeleton />
  if (q.isError || !q.data) return <ErrorAlert error={q.error} onRetry={() => q.refetch()} />

  return (
    <div className="stack">
      <div className="rf-page-head">
        <div>
          <Link className="rf-link rf-sm" to="/">← Companies</Link>
          <h1 style={{ margin: 0 }}>{q.data.business_name}</h1>
        </div>
        <button className="rf-btn rf-btn--secondary" onClick={() => setRenaming(true)}>Rename company</button>
      </div>

      {!q.data.has_usable_certificate && (
        <div className="rf-alert rf-alert--warning">
          <div><strong>No usable certificate.</strong> Upload a valid TaxCore certificate before invoices can be fiscalized.</div>
          <button className="rf-btn rf-btn--secondary rf-btn--sm" onClick={() => setTab('certificates')}>Upload certificate</button>
        </div>
      )}

      <div className="rf-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className="rf-tab" onClick={() => setTab(t)}>
            {LABEL[t]}
          </button>
        ))}
      </div>

      {tab === 'invoices' && <InvoicesTab companyId={id} />}
      {tab === 'certificates' && <CertificatesTab companyId={id} />}
      {tab === 'xero' && <XeroTab companyId={id} />}

      {renaming && <CompanyForm company={q.data} onClose={() => setRenaming(false)} />}
    </div>
  )
}
