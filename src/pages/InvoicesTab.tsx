import { useState } from 'react'
import { useCreateInvoice, useInvoice, useInvoiceCounts, useInvoices } from '../api/hooks'
import type { InvoiceStatus } from '../api/types'
import { Badge, Empty, ErrorAlert, Field, Modal, Pager, Skeleton } from '../components/ui'
import { STATUS_BADGE } from '../components/status'
import { formatDate, formatVT } from '../format'

const FILTERS: Array<{ value: '' | InvoiceStatus; label: string }> = [
  { value: '', label: 'All' },
  { value: 'fiscalized', label: 'Fiscalized' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

const SAMPLE = {
  external_id: 'INV-0001',
  invoice: {
    invoiceType: 'Normal',
    transactionType: 'Sale',
    payment: [{ amount: 115, paymentType: 'Cash' }],
    items: [{ name: 'Coffee', quantity: 1, unitPrice: 115, labels: ['A'], totalAmount: 115 }],
  },
}

export function InvoicesTab({ companyId }: { companyId: number }) {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'' | InvoiceStatus>('')
  const [open, setOpen] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
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
        <button className="rf-btn rf-btn--secondary" onClick={() => setCreating(true)}>Fiscalize invoice</button>
      </div>

      {q.isError && <ErrorAlert error={q.error} onRetry={() => q.refetch()} />}
      {q.isLoading && <Skeleton />}
      {q.data && q.data.data.length === 0 && (
        <Empty title="No invoices" text={status ? 'No invoice has this status.' : 'Invoices appear here when Xero sends them or you fiscalize one by hand.'} />
      )}
      {q.data && q.data.data.length > 0 && (
        <div className="rf-table-wrap">
          <table className="rf-table">
            <thead>
              <tr><th>External ID</th><th>TaxCore number</th><th>Status</th><th className="rf-col-num">Total</th><th>Created</th></tr>
            </thead>
            <tbody>
              {q.data.data.map((i) => (
                <tr key={i.id} onClick={() => setOpen(i.id)} style={{ cursor: 'pointer' }}>
                  <td className="rf-col-id trunc" title={i.external_id}>{i.external_id}</td>
                  <td className="rf-col-id">{i.invoice_number ?? '—'}</td>
                  <td>
                    <Badge cls={STATUS_BADGE[i.status].cls}>{STATUS_BADGE[i.status].label}</Badge>
                    {i.warning && <span title={i.warning}> ⚠</span>}
                  </td>
                  <td className="rf-col-num">{formatVT(i.total_amount)}</td>
                  <td>{formatDate(i.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pager page={q.data.meta.current_page} last={q.data.meta.last_page} total={q.data.meta.total} onPage={setPage} />
        </div>
      )}

      {open !== null && <InvoiceDetail companyId={companyId} id={open} onClose={() => setOpen(null)} />}
      {creating && <CreateInvoice companyId={companyId} onClose={() => setCreating(false)} />}
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

function CreateInvoice({ companyId, onClose }: { companyId: number; onClose: () => void }) {
  const create = useCreateInvoice(companyId)
  const [text, setText] = useState(JSON.stringify(SAMPLE, null, 2))
  const [parseError, setParseError] = useState('')

  function send() {
    try {
      const body = JSON.parse(text)
      setParseError('')
      create.mutate(body, { onSuccess: onClose })
    } catch {
      setParseError('This is not valid JSON.')
    }
  }

  return (
    <Modal
      title="Fiscalize invoice"
      onClose={onClose}
      foot={
        <>
          <button className="rf-btn rf-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="rf-btn rf-btn--primary" disabled={create.isPending} aria-busy={create.isPending} onClick={send}>
            {create.isPending ? 'Sending to TaxCore…' : 'Fiscalize invoice'}
          </button>
        </>
      }
    >
      <div className="form" style={{ maxWidth: 'none' }}>
        <p className="rf-muted rf-sm" style={{ margin: 0 }}>
          Sends a real invoice to TaxCore for this company. Resending the same <span className="rf-mono">external_id</span> with the same data returns the saved invoice.
        </p>
        <Field label="Invoice JSON" error={parseError || (create.error ? (create.error as Error).message : undefined)}>
          <textarea className="rf-textarea rf-input--mono" rows={16} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        </Field>
      </div>
    </Modal>
  )
}
