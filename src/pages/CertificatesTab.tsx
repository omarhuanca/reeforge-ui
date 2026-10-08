import { useCertificates } from '../api/hooks'
import type { Certificate } from '../api/types'
import { Badge, Empty, ErrorAlert, Skeleton } from '../components/ui'
import { daysUntil, formatDate } from '../format'

function certBadge(c: Certificate) {
  if (c.revoked_at) return <Badge cls="rf-badge--danger">Revoked</Badge>
  const days = daysUntil(c.valid_to)
  if (days < 0) return <Badge cls="rf-badge--neutral">Expired</Badge>
  if (days <= 30) return <Badge cls="rf-badge--warning">Expires in {days} days</Badge>
  return <Badge cls="rf-badge--success">Valid</Badge>
}

/** The upload form lives in a modal owned by the company page; this tab only asks to open it. */
export function CertificatesTab({ companyId, onUpload }: { companyId: number; onUpload: () => void }) {
  const q = useCertificates(companyId)

  return (
    <div className="stack">
      {q.isError && <ErrorAlert error={q.error} onRetry={() => q.refetch()} />}
      {q.isLoading && <Skeleton />}
      {q.data && q.data.length === 0 && (
        <Empty
          compact
          title="No certificates"
          text="Upload the .p12 file TaxCore gave you."
          action={<button className="rf-btn rf-btn--primary" onClick={onUpload}>Upload certificate</button>}
        />
      )}
      {q.data && q.data.length > 0 && (
        <>
          <div className="row row--end">
            <button className="rf-btn rf-btn--secondary" onClick={onUpload}>Upload certificate</button>
          </div>
          <div className="rf-table-wrap">
            <table className="rf-table">
              <thead>
                <tr><th>Location</th><th>UID</th><th>Environment</th><th>Status</th><th>Valid until</th></tr>
              </thead>
              <tbody>
                {q.data.map((c) => (
                  <tr key={c.id}>
                    <td>{c.common_name}</td>
                    <td className="rf-col-id">{c.uid}</td>
                    <td>{c.environment}</td>
                    <td>{certBadge(c)}</td>
                    <td>{formatDate(c.valid_to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
