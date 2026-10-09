import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useCompany, useXeroPending } from '../api/hooks'
import { Badge, ErrorAlert, Skeleton } from '../components/ui'
import { formatDate, pendingHeadline } from '../format'
import { CompanyForm } from './CompaniesPage'
import { InvoicesTab } from './InvoicesTab'
import { CertificatesTab } from './CertificatesTab'
import { UploadCertificateModal } from './UploadCertificateModal'
import { XeroTab } from './XeroTab'

const TABS = ['invoices', 'certificates', 'xero'] as const
type Tab = (typeof TABS)[number]
const LABEL: Record<Tab, string> = { invoices: 'Invoices', certificates: 'Certificates', xero: 'Xero' }

export function CompanyPage() {
  const id = Number(useParams().id)
  const q = useCompany(id)
  const pendingCount = useXeroPending(id, true).data?.length ?? 0
  const params = useSearchParams()[0]
  const requested = params.get('tab')
  const [tab, setTab] = useState<Tab>(TABS.find((t) => t === requested) ?? (params.get('upload') ? 'certificates' : 'invoices'))
  const [renaming, setRenaming] = useState(false)
  const [uploading, setUploading] = useState(params.get('upload') === '1')
  const [toast, setToast] = useState('')

  // A finished action is confirmed with a toast that disappears after 5 seconds.
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 5000)
    return () => clearTimeout(t)
  }, [toast])

  if (q.isLoading) return <Skeleton />
  if (q.isError || !q.data) return <ErrorAlert error={q.error} onRetry={() => q.refetch()} />

  const company = q.data
  const needsCertificate = !company.has_usable_certificate

  return (
    <div className="stack">
      <div className="rf-page-head">
        <div>
          <Link className="rf-link rf-sm" to="/">← Companies</Link>
          <h1 style={{ margin: 0 }}>{company.business_name}</h1>
          <p className="row rf-muted rf-sm" style={{ margin: 0 }}>
            {needsCertificate ? <Badge cls="rf-badge--warning">Certificate: needs setup</Badge> : <Badge cls="rf-badge--success">Certificate: valid</Badge>}
            <span>Created {formatDate(company.created_at)}</span>
          </p>
        </div>
        {/* One primary action, and it follows the situation. */}
        <div className="row">
          <button className="rf-btn rf-btn--secondary" onClick={() => setRenaming(true)}>Rename company</button>
          {needsCertificate && <button className="rf-btn rf-btn--primary" onClick={() => setUploading(true)}>Upload certificate</button>}
        </div>
      </div>

      {needsCertificate && (
        <div className="rf-alert rf-alert--warning">
          <div><strong>No usable certificate.</strong> Upload a valid TaxCore certificate before invoices can be fiscalized.</div>
        </div>
      )}

      {pendingCount > 0 && tab !== 'xero' && (
        <div className="rf-alert rf-alert--warning" role="status">
          <div>
            <strong>{pendingHeadline(pendingCount)}</strong> They are not fiscalized until the cause is fixed.{' '}
            <button type="button" className="rf-link" onClick={() => setTab('xero')}>Review pending documents</button>
          </div>
        </div>
      )}

      <div className="rf-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            aria-label={t === 'xero' && pendingCount > 0 ? `Xero, ${pendingCount} pending` : undefined}
            className="rf-tab"
            onClick={() => setTab(t)}
          >
            {LABEL[t]}
            {t === 'xero' && pendingCount > 0 && <span className="rf-tab__count" aria-hidden="true">{pendingCount}</span>}
          </button>
        ))}
      </div>

      {tab === 'invoices' && <InvoicesTab companyId={id} />}
      {tab === 'certificates' && <CertificatesTab companyId={id} onUpload={() => setUploading(true)} onDeleted={setToast} />}
      {tab === 'xero' && <XeroTab companyId={id} />}

      {renaming && <CompanyForm company={company} onClose={() => setRenaming(false)} />}
      {uploading && <UploadCertificateModal companyId={id} onClose={() => setUploading(false)} onUploaded={() => { setToast('Certificate uploaded'); setTab('certificates') }} />}
      {toast && <div className="rf-toast toast-fixed" role="status">{toast}</div>}
    </div>
  )
}
