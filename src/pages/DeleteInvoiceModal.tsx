import { ApiError } from '../api/client'
import { useDeleteInvoice } from '../api/hooks'
import type { Invoice } from '../api/types'
import { ErrorAlert, Modal } from '../components/ui'

/** Confirms a permanent delete of an invoice TaxCore rejected; the API refuses (409) anything that may be signed. */
export function DeleteInvoiceModal({
  companyId,
  invoice,
  onClose,
  onDeleted,
}: {
  companyId: number
  invoice: Invoice
  onClose: () => void
  onDeleted: (message: string) => void
}) {
  const del = useDeleteInvoice(companyId)

  return (
    <Modal
      title={`Delete invoice ${invoice.external_id}?`}
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
              del.mutate(invoice.id, {
                onSuccess: () => {
                  onDeleted('Invoice deleted')
                  onClose()
                },
              })
            }
          >
            {del.isPending ? 'Deleting…' : 'Delete invoice'}
          </button>
        </>
      }
    >
      <div className="stack" style={{ gap: 12 }}>
        {invoice.error?.message && (
          <div className="rf-alert rf-alert--danger"><div><strong>TaxCore rejected it.</strong> {invoice.error.message}</div></div>
        )}
        <p style={{ margin: 0 }}>
          This invoice was never signed, so deleting it erases it from Reeforge. You can send the same external ID again afterwards. It cannot be undone.
        </p>
        {/* A 409 is an expected refusal (it may be signed): say why, without the generic failure wording. */}
        {del.error instanceof ApiError && del.error.status === 409 ? (
          <div className="rf-alert rf-alert--warning" role="alert"><div>{del.error.message}</div></div>
        ) : (
          del.isError && <ErrorAlert error={del.error} />
        )}
      </div>
    </Modal>
  )
}
