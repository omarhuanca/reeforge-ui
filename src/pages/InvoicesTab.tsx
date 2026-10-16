import { useState } from 'react'
import { useInvoice, useInvoiceCounts, useInvoices } from '../api/hooks'
import type { Channel, Invoice, InvoiceStatus } from '../api/types'
import { IconMore, IconTrash } from '../components/icons'
import { Menu } from '../components/Menu'
import { Badge, Empty, ErrorAlert, Modal, Pager, Skeleton } from '../components/ui'
import { STATUS_BADGE } from '../components/status'
import { formatDate, formatVT } from '../format'
import { DeleteInvoiceModal } from './DeleteInvoiceModal'
import { InvoiceFormModal } from './InvoiceFormModal'
import { canFiscalizeByHand } from './channels'
import { canDeleteInvoice } from './invoices'

const FILTERS: Array<{ value: '' | InvoiceStatus; label: string }> = [
  { value: '', label: 'All' },
  { value: 'fiscalized', label: 'Fiscalized' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

export function InvoicesTab({ companyId, channel, onDeleted }: { companyId: number; channel: Channel; onDeleted: (message: string) => void }) {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'' | InvoiceStatus>('')
  const [open, setOpen] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Invoice | null>(null)
  const q = useInvoices(companyId, page, status)
  const counts = useInvoiceCounts(companyId)

  return (
    <div className="stack">
      <div className="rf-toolbar">
        <div className="rf-segmented" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button key={f.value} aria-pressed={status === f.value} onClick={() => { setStatus(f.value); setPage(1) }}>
              {f.label}
              <span className={`rf-segmented__count${f.value === 'failed' ? ' rf-segmented__count--danger' : ''}`}>
                {counts[f.value] ?? '–'}
              </span>
            </button>
          ))}
        </div>
        <span className="rf-toolbar__spacer" />
        {canFiscalizeByHand(channel) ? (
          <button className="rf-btn rf-btn--secondary" onClick={() => setCreating(true)}>Fiscalize invoice</button>
        ) : (
          <span className="rf-muted rf-sm">Invoices come from Xero: approve them there.</span>
        )}
      </div>

      {q.isError && <ErrorAlert error={q.error} onRetry={() => q.refetch()} />}
      {q.isLoading && <Skeleton />}
      {q.data && q.data.data.length === 0 && (
        <Empty title="No invoices" text={status ? 'No invoice has this status.' : channel === 'xero' ? 'Invoices appear here when you approve them in Xero.' : 'Invoices appear here when you fiscalize them.'} />
      )}
      {q.data && q.data.data.length > 0 && (
        <div className="rf-table-wrap rf-table-wrap--menus">
          <table className="rf-table rf-table--stack">
            <thead>
              <tr>
                <th>External ID</th><th>TaxCore number</th><th>Status</th><th className="rf-col-num">Total</th><th>Created</th>
                <th style={{ width: 48 }}><span className="rf-sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {q.data.data.map((i) => (
                <tr key={i.id} onClick={() => setOpen(i.id)} style={{ cursor: 'pointer' }}>
                  <td className="rf-col-id trunc rf-cell-title" title={i.external_id}>{i.external_id}</td>
                  <td className="rf-col-id" data-label="TaxCore number">{i.invoice_number ?? '—'}</td>
                  <td data-label="Status">
                    <Badge cls={STATUS_BADGE[i.status].cls}>{STATUS_BADGE[i.status].label}</Badge>
                    {i.warning && <span title={i.warning}> ⚠</span>}
                  </td>
                  <td className="rf-col-num" data-label="Total">{formatVT(i.total_amount)}</td>
                  <td data-label="Created">{formatDate(i.created_at)}</td>
                  {/* Only an invoice TaxCore rejected for good can be deleted; the rest never gets a menu. */}
                  <td className="rf-col-num rf-cell-actions" onClick={(e) => e.stopPropagation()}>
                    {canDeleteInvoice(i) && (
                      <Menu label={`Actions for invoice ${i.external_id}`} buttonClass="rf-btn rf-btn--ghost rf-icon-btn rf-btn--sm" trigger={<IconMore />}>
                        {(close) => (
                          <button type="button" className="rf-menu__item rf-menu__item--danger" role="menuitem" onClick={() => { close(); setDeleting(i) }}>
                            <IconTrash />Delete invoice
                          </button>
                        )}
                      </Menu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pager page={q.data.meta.current_page} last={q.data.meta.last_page} total={q.data.meta.total} onPage={setPage} />
        </div>
      )}

      {open !== null && <InvoiceDetail companyId={companyId} id={open} onClose={() => setOpen(null)} />}
      {creating && <InvoiceFormModal companyId={companyId} onClose={() => setCreating(false)} />}
      {deleting && <DeleteInvoiceModal companyId={companyId} invoice={deleting} onClose={() => setDeleting(null)} onDeleted={onDeleted} />}
    </div>
  )
}

function InvoiceDetail({ companyId, id, onClose }: { companyId: number; id: number; onClose: () => void }) {
  const q = useInvoice(companyId, id)
  const i = q.data
  return (
    <Modal title={i ? `Invoice ${i.external_id}` : 'Invoice'} onClose={onClose} foot={<button className="rf-btn rf-btn--secondary" onClick={onClose}>Close</button>}>
      {q.isLoading && <Skeleton rows={3} />}
      {q.isError && <ErrorAlert error={q.error} />}
      {i && (
        <div className="stack" style={{ gap: 12 }}>
          <div className="row">
            <Badge cls={STATUS_BADGE[i.status].cls}>{STATUS_BADGE[i.status].label}</Badge>
            <span className="rf-num">{formatVT(i.total_amount)}</span>
            <span className="rf-muted">· {i.attempts} attempt{i.attempts === 1 ? '' : 's'}</span>
          </div>
          {i.warning && <div className="rf-alert rf-alert--warning">{i.warning}</div>}
          {i.error && <div className="rf-alert rf-alert--danger">{i.error.message ?? 'TaxCore rejected the invoice.'}{i.error.retryable ? ' Resending the same data may work.' : ''}</div>}
          <dl className="rf-sm" style={{ margin: 0 }}>
            <dt className="rf-muted">TaxCore number</dt><dd className="rf-mono">{i.invoice_number ?? '—'}</dd>
            <dt className="rf-muted">Request ID</dt><dd className="rf-mono">{i.request_id ?? '—'}</dd>
            <dt className="rf-muted">Location</dt><dd>{i.certificate?.location ?? '—'}</dd>
            <dt className="rf-muted">Fiscalized</dt><dd>{formatDate(i.fiscalized_at)}</dd>
          </dl>
          {i.verification_url && <a className="rf-link" href={i.verification_url} target="_blank" rel="noreferrer">Open verification page</a>}
          {i.verification_qr && <img src={i.verification_qr} alt="Verification QR code" width={140} height={140} />}
          {i.journal && <pre className="journal">{i.journal}</pre>}
        </div>
      )}
    </Modal>
  )
}
