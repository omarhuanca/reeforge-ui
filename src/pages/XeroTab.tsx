import { useState, type FormEvent } from 'react'
import { useXero, useXeroDisconnect, useXeroPending, useXeroSettings } from '../api/hooks'
import { ApiError } from '../api/client'
import { XERO_PAYMENT_TYPES, type XeroConnection } from '../api/types'
import { Badge, ErrorAlert, Field, Modal, Skeleton } from '../components/ui'
import { formatDate, parseTaxLabels, stringifyTaxLabels } from '../format'
import { ConnectXeroModal } from './ConnectXeroModal'

export function XeroTab({ companyId }: { companyId: number }) {
  const q = useXero(companyId)
  // The modal lives here, not in the children: connecting swaps NotConnected for Connected,
  // and it has to stay open to show the outcome.
  const [connecting, setConnecting] = useState(false)
  if (q.isLoading) return <Skeleton rows={3} />
  if (q.isError) return <ErrorAlert error={q.error} onRetry={() => q.refetch()} />
  return (
    <>
      {q.data ? <Connected companyId={companyId} conn={q.data} onConnect={() => setConnecting(true)} /> : <NotConnected onConnect={() => setConnecting(true)} />}
      {connecting && <ConnectXeroModal companyId={companyId} onClose={() => setConnecting(false)} />}
    </>
  )
}

function NotConnected({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="rf-panel rf-panel__body stack" style={{ gap: 12 }}>
      <div className="row"><h2 style={{ margin: 0 }}>Xero</h2><Badge cls="rf-badge--neutral">Not connected</Badge></div>
      <p className="rf-muted" style={{ margin: 0 }}>
        Connect the company's Xero organisation here, or send the accountant a one-time link to do it.
      </p>
      <div><button className="rf-btn rf-btn--primary" onClick={onConnect}>Connect Xero</button></div>
    </div>
  )
}

function Connected({ companyId, conn, onConnect }: { companyId: number; conn: XeroConnection; onConnect: () => void }) {
  const pending = useXeroPending(companyId, true)
  const disconnect = useXeroDisconnect(companyId)
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="stack">
      <div className="rf-panel rf-panel__body stack" style={{ gap: 12 }}>
        <div className="row">
          <h2 style={{ margin: 0 }}>{conn.tenant_name ?? 'Xero organisation'}</h2>
          {conn.configured ? <Badge cls="rf-badge--success">Connected</Badge> : <Badge cls="rf-badge--warning">Needs setup</Badge>}
        </div>
        <p className="rf-muted rf-sm" style={{ margin: 0 }}>Connected {formatDate(conn.connected_at)} · last reconciled {formatDate(conn.reconciled_at)}</p>
        <div className="row">
          <button className="rf-btn rf-btn--secondary rf-btn--sm" onClick={onConnect}>Reconnect Xero</button>
          <button className="rf-btn rf-btn--danger-ghost rf-btn--sm" onClick={() => setConfirm(true)}>Disconnect Xero</button>
        </div>
      </div>

      <MappingForm key={JSON.stringify([conn.tax_labels, conn.payment_type])} companyId={companyId} conn={conn} />

      <div className="stack" style={{ gap: 8 }}>
        <h2 style={{ margin: 0 }}>Waiting on Xero documents</h2>
        {pending.isError && <ErrorAlert error={pending.error} onRetry={() => pending.refetch()} />}
        {pending.isLoading && <Skeleton rows={2} />}
        {pending.data && pending.data.length === 0 && <p className="rf-muted">Nothing is waiting.</p>}
        {pending.data && pending.data.length > 0 && (
          <div className="rf-table-wrap">
            <table className="rf-table">
              <thead><tr><th>Number</th><th>Type</th><th>Reason</th><th>Last attempt</th></tr></thead>
              <tbody>
                {pending.data.map((p) => (
                  <tr key={p.xero_id}>
                    <td className="rf-col-id">{p.number ?? p.xero_id}</td>
                    <td>{p.xero_type}</td>
                    <td>{p.reason}</td>
                    <td>{formatDate(p.last_attempt_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirm && (
        <Modal
          title={`Disconnect ${conn.tenant_name ?? 'Xero'}?`}
          onClose={() => setConfirm(false)}
          foot={
            <>
              <button className="rf-btn rf-btn--secondary" onClick={() => setConfirm(false)}>Cancel</button>
              <button className="rf-btn rf-btn--danger" disabled={disconnect.isPending} onClick={() => disconnect.mutate(undefined, { onSuccess: () => setConfirm(false) })}>
                {disconnect.isPending ? 'Disconnecting…' : 'Disconnect Xero'}
              </button>
            </>
          }
        >
          <p>New Xero invoices will stop being fiscalized, and the tax mapping is lost. The accountant can reconnect with a new link.</p>
          {disconnect.isError && <ErrorAlert error={disconnect.error} />}
        </Modal>
      )}
    </div>
  )
}

function MappingForm({ companyId, conn }: { companyId: number; conn: XeroConnection }) {
  const save = useXeroSettings(companyId)
  const [labels, setLabels] = useState(stringifyTaxLabels(conn.tax_labels))
  const [payment, setPayment] = useState(conn.payment_type ?? 'Other')
  const [saved, setSaved] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    setSaved(false)
    save.mutate({ tax_labels: parseTaxLabels(labels), payment_type: payment }, { onSuccess: () => setSaved(true) })
  }
  const errs = save.error instanceof ApiError ? Object.values(save.error.errors).flat() : []

  return (
    <form className="rf-panel rf-panel__body form" onSubmit={submit}>
      <h2 style={{ margin: 0 }}>Invoice mapping</h2>
      <Field label="Tax labels" help="One per line: Xero tax type = TaxCore label, e.g. OUTPUT=A">
        <textarea className="rf-textarea rf-input--mono" rows={5} value={labels} onChange={(e) => setLabels(e.target.value)} spellCheck={false} />
      </Field>
      <Field label="Payment type for unpaid invoices">
        <select className="rf-select" value={payment} onChange={(e) => setPayment(e.target.value)}>
          {XERO_PAYMENT_TYPES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </Field>
      {errs.map((m) => <div key={m} className="rf-alert rf-alert--danger">{m}</div>)}
      {saved && <div className="rf-alert rf-alert--success">Settings saved.</div>}
      <div><button className="rf-btn rf-btn--primary" disabled={save.isPending} aria-busy={save.isPending}>{save.isPending ? 'Saving…' : 'Save settings'}</button></div>
    </form>
  )
}
