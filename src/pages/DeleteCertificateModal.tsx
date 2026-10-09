import { useDeleteCertificate } from '../api/hooks'
import { ApiError } from '../api/client'
import type { Certificate } from '../api/types'
import { ErrorAlert, Modal } from '../components/ui'

/** Confirms a permanent delete; the API refuses (409) when the certificate ever signed an invoice. */
export function DeleteCertificateModal({
  companyId,
  certificate,
  lastUsable,
  onClose,
  onDeleted,
}: {
  companyId: number
  certificate: Certificate
  lastUsable: boolean
  onClose: () => void
  onDeleted: (message: string) => void
}) {
  const del = useDeleteCertificate(companyId)

  return (
    <Modal
      title={`Delete certificate ${certificate.uid}?`}
      onClose={onClose}
      foot={
        <>
          <button type="button" className="rf-btn rf-btn--secondary" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="rf-btn rf-btn--danger"
            disabled={del.isPending}
            aria-busy={del.isPending}
            onClick={() =>
              del.mutate(certificate.id, {
                onSuccess: (r) => {
                  onDeleted(r.message)
                  onClose()
                },
              })
            }
          >
            {del.isPending ? 'Deleting…' : 'Delete certificate'}
          </button>
        </>
      }
    >
      <div className="stack" style={{ gap: 12 }}>
        <p style={{ margin: 0 }}>
          This permanently erases the certificate file, its password and its PAC. It cannot be undone. A certificate that has signed invoices cannot be deleted.
        </p>
        {lastUsable && (
          <div className="rf-alert rf-alert--warning">
            <div><strong>This is the last valid certificate.</strong> Invoices cannot be fiscalized until you upload a new one.</div>
          </div>
        )}
        {/* A 409 is an expected refusal (it signed invoices): say why, without the generic failure wording. */}
        {del.error instanceof ApiError && del.error.status === 409 ? (
          <div className="rf-alert rf-alert--danger" role="alert"><div>{del.error.message}</div></div>
        ) : (
          del.isError && <ErrorAlert error={del.error} />
        )}
      </div>
    </Modal>
  )
}
