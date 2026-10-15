import { useState, type FormEvent } from 'react'
import { errorMessage } from '../api/client'
import { useCreateInvoice, useInvoices } from '../api/hooks'
import { asSentence, taxCoreRejection } from '../api/taxcore'
import { PAYMENT_TYPES } from '../api/types'
import { IconTrash } from '../components/icons'
import { Field, Modal } from '../components/ui'
import {
  INVOICE_TYPES,
  TRANSACTION_TYPES,
  buildInvoice,
  emptyForm,
  emptyLine,
  formFromJson,
  invoiceProblems,
  itemsTotal,
  lineTotal,
  paymentsTotal,
  syncPayment,
  toJsonText,
  type InvoiceFormState,
  type LineForm,
  type PaymentForm,
} from './invoiceForm'

const money = (n: number) => n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const SHOWN_PROBLEMS = 3

/**
 * Creates and fiscalizes an invoice for the company: items, payments and the sale or refund.
 * The JSON mode is the advanced way in: it sends exactly what is typed, including fields the form has no input for.
 */
export function InvoiceFormModal({ companyId, onClose }: { companyId: number; onClose: () => void }) {
  const create = useCreateInvoice(companyId)
  const [form, setForm] = useState<InvoiceFormState>(() => emptyForm())
  const [mode, setMode] = useState<'form' | 'json'>('form')
  const [jsonText, setJsonText] = useState('')
  const [dropped, setDropped] = useState<string[]>([])
  const [jsonError, setJsonError] = useState('')
  const problems = invoiceProblems(form)

  function showJson() {
    setJsonText(toJsonText(form))
    setJsonError('')
    setDropped([])
    create.reset()
    setMode('json')
  }

  function showForm() {
    const back = formFromJson(jsonText)
    if (!back) {
      setJsonError('This is not an invoice: it must be valid JSON with an "invoice" object.')
      return
    }
    setForm(back.form)
    setDropped(back.dropped)
    setJsonError('')
    create.reset()
    setMode('form')
  }

  const jsonBody = (): unknown => {
    try {
      return JSON.parse(jsonText)
    } catch {
      return undefined
    }
  }

  const set = (patch: Partial<InvoiceFormState>) => setForm((f) => ({ ...f, ...patch }))
  const setLine = (i: number, patch: Partial<LineForm>) =>
    setForm((f) => syncPayment({ ...f, lines: f.lines.map((l, k) => (k === i ? { ...l, ...patch } : l)) }))
  const addLine = () => setForm((f) => syncPayment({ ...f, lines: [...f.lines, emptyLine()] }))
  const removeLine = (i: number) => setForm((f) => (f.lines.length > 1 ? syncPayment({ ...f, lines: f.lines.filter((_, k) => k !== i) }) : f))
  const setPayment = (i: number, patch: Partial<PaymentForm>) =>
    setForm((f) => ({ ...f, paymentTouched: true, payments: f.payments.map((p, k) => (k === i ? { ...p, ...patch } : p)) }))
  const addPayment = () =>
    setForm((f) => {
      const rest = Math.max(0, Math.round((itemsTotal(f) - paymentsTotal(f)) * 100) / 100)
      return { ...f, paymentTouched: true, payments: [...f.payments, { paymentType: 'Card', amount: rest > 0 ? String(rest) : '' }] }
    })
  const removePayment = (i: number) =>
    setForm((f) => (f.payments.length > 1 ? syncPayment({ ...f, paymentTouched: f.payments.length - 1 > 1, payments: f.payments.filter((_, k) => k !== i) }) : f))

  function submit(e: FormEvent) {
    e.preventDefault()
    if (mode === 'json') {
      const body = jsonBody()
      if (body === undefined) return setJsonError('This is not valid JSON.')
      return create.mutate(body, { onSuccess: onClose })
    }
    if (problems.length > 0) return
    create.mutate(buildInvoice(form), { onSuccess: onClose })
  }

  return (
    <Modal
      title="Fiscalize invoice"
      wide
      onClose={onClose}
      foot={
        <>
          <button type="button" className="rf-btn rf-btn--secondary" onClick={onClose}>Cancel</button>
          <button
            type="submit"
            form="invoice-form"
            className="rf-btn rf-btn--primary"
            disabled={create.isPending || (mode === 'form' ? problems.length > 0 : !jsonText.trim())}
            aria-busy={create.isPending}
          >
            {create.isPending ? 'Sending to TaxCore…' : 'Fiscalize invoice'}
          </button>
        </>
      }
    >
      <form id="invoice-form" className="form" style={{ maxWidth: 'none' }} onSubmit={submit} noValidate>
        <p className="rf-muted rf-sm" style={{ margin: 0 }}>
          Sends a real invoice to TaxCore for this company. Resending the same external ID with the same data returns the saved invoice.
        </p>

        <div className="rf-segmented" role="group" aria-label="Invoice input">
          <button type="button" aria-pressed={mode === 'form'} onClick={() => (mode === 'json' ? showForm() : undefined)}>Form</button>
          <button type="button" aria-pressed={mode === 'json'} onClick={() => (mode === 'form' ? showJson() : undefined)}>JSON</button>
        </div>

        {mode === 'json' ? (
          <>
            <Field label="Invoice JSON" error={jsonError || undefined} help="Sent as typed: external_id plus the TaxCore invoice. Use it for fields the form has no input for.">
              <textarea className="rf-textarea rf-input--mono" rows={16} value={jsonText} onChange={(e) => { setJsonText(e.target.value); setJsonError('') }} spellCheck={false} aria-invalid={!!jsonError} />
            </Field>
            {create.isError && <CreateFailure error={create.error} />}
          </>
        ) : (
          <>
            {dropped.length > 0 && (
              <div className="rf-alert rf-alert--warning" role="status">
                <div>The form has no input for these fields, so they will not be sent: <span className="rf-mono">{dropped.join(', ')}</span>. Use the JSON mode to send them.</div>
              </div>
            )}

            <div className="inv-top">
              <Field label="External ID">
                <input className="rf-input rf-input--mono" value={form.externalId} onChange={(e) => set({ externalId: e.target.value })} />
              </Field>
              <Field label="Invoice type">
                <select className="rf-select" value={form.invoiceType} onChange={(e) => set({ invoiceType: e.target.value as InvoiceFormState['invoiceType'] })}>
                  {INVOICE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Transaction">
                <select className="rf-select" value={form.transactionType} onChange={(e) => set({ transactionType: e.target.value as InvoiceFormState['transactionType'] })}>
                  {TRANSACTION_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            {form.transactionType === 'Refund' && (
              <RefundReference companyId={companyId} value={form.referentDocumentNumber} onChange={(referentDocumentNumber) => set({ referentDocumentNumber })} />
            )}

            <fieldset className="inv-section">
              <legend className="rf-label">Items</legend>
              <div className="inv-grid inv-head" aria-hidden="true">
                <span>Item</span><span>Qty</span><span>Unit price</span><span>Tax</span><span className="inv-num">Total</span><span />
              </div>
              {form.lines.map((l, i) => (
                <div className="inv-grid" key={i}>
                  <input className="rf-input" aria-label={`Line ${i + 1} item name`} placeholder="Item name" value={l.name} onChange={(e) => setLine(i, { name: e.target.value })} />
                  <input className="rf-input" aria-label={`Line ${i + 1} quantity`} inputMode="decimal" value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} />
                  <input className="rf-input" aria-label={`Line ${i + 1} unit price`} inputMode="decimal" placeholder="0" value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: e.target.value })} />
                  <input className="rf-input rf-input--mono" aria-label={`Line ${i + 1} tax label`} maxLength={2} value={l.label} onChange={(e) => setLine(i, { label: e.target.value.toUpperCase() })} />
                  <span className="inv-num inv-total" aria-label={`Line ${i + 1} total`}>{money(lineTotal(l))}</span>
                  <button type="button" className="rf-btn rf-btn--ghost rf-icon-btn rf-btn--sm" aria-label={`Remove line ${i + 1}`} disabled={form.lines.length === 1} onClick={() => removeLine(i)}>
                    <IconTrash />
                  </button>
                </div>
              ))}
              <div><button type="button" className="rf-btn rf-btn--secondary rf-btn--sm" onClick={addLine}>Add line</button></div>
            </fieldset>

            <fieldset className="inv-section">
              <legend className="rf-label">Payments</legend>
              {form.payments.map((p, i) => (
                <div className="inv-grid inv-grid--payments" key={i}>
                  <select className="rf-select" aria-label={`Payment ${i + 1} type`} value={p.paymentType} onChange={(e) => setPayment(i, { paymentType: e.target.value })}>
                    {PAYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <input className="rf-input" aria-label={`Payment ${i + 1} amount`} inputMode="decimal" placeholder="0" value={p.amount} onChange={(e) => setPayment(i, { amount: e.target.value })} />
                  <button type="button" className="rf-btn rf-btn--ghost rf-icon-btn rf-btn--sm" aria-label={`Remove payment ${i + 1}`} disabled={form.payments.length === 1} onClick={() => removePayment(i)}>
                    <IconTrash />
                  </button>
                </div>
              ))}
              <div><button type="button" className="rf-btn rf-btn--secondary rf-btn--sm" onClick={addPayment}>Add payment</button></div>
            </fieldset>

            <details>
              <summary className="rf-sm rf-muted" style={{ cursor: 'pointer' }}>More details (optional)</summary>
              <div className="inv-top" style={{ marginTop: 8 }}>
                <Field label="Buyer ID">
                  <input className="rf-input" value={form.buyerId} onChange={(e) => set({ buyerId: e.target.value })} />
                </Field>
                <Field label="Cashier">
                  <input className="rf-input" value={form.cashier} onChange={(e) => set({ cashier: e.target.value })} />
                </Field>
              </div>
            </details>

            <div className="inv-totals" role="status">
              <span>Items <strong>{money(itemsTotal(form))}</strong></span>
              <span>Payments <strong>{money(paymentsTotal(form))}</strong></span>
            </div>

            {problems.length > 0 && (
              <ul className="rf-sm rf-muted inv-problems" aria-label="To send this invoice">
                {problems.slice(0, SHOWN_PROBLEMS).map((p) => <li key={p}>{p}</li>)}
                {problems.length > SHOWN_PROBLEMS && <li>…and {problems.length - SHOWN_PROBLEMS} more.</li>}
              </ul>
            )}

            {create.isError && <CreateFailure error={create.error} />}
          </>
        )}
      </form>
    </Modal>
  )
}

/** The invoice a refund gives money back for: any number can be typed; the fiscalized ones are suggested. */
function RefundReference({ companyId, value, onChange }: { companyId: number; value: string; onChange: (v: string) => void }) {
  const fiscalized = useInvoices(companyId, 1, 'fiscalized')
  const numbers = (fiscalized.data?.data ?? []).map((i) => i.invoice_number).filter((n): n is string => !!n)
  return (
    <Field label="Original invoice number" help="The TaxCore number of the invoice being refunded.">
      <input className="rf-input rf-input--mono" list="refund-invoices" value={value} onChange={(e) => onChange(e.target.value)} />
      <datalist id="refund-invoices">{numbers.map((n) => <option key={n} value={n} />)}</datalist>
    </Field>
  )
}

/** Says why the invoice was not signed and what to do next. */
function CreateFailure({ error }: { error: unknown }) {
  const rejection = taxCoreRejection(error)

  if (!rejection) {
    return <div className="rf-alert rf-alert--danger" role="alert"><div>{errorMessage(error)}</div></div>
  }

  if (rejection.retryable) {
    return (
      <div className="rf-alert rf-alert--warning" role="alert">
        <div>
          <strong>TaxCore did not answer.</strong> {asSentence(rejection.message)} It may have been signed, so send the same data again to retry; do not change it.
        </div>
      </div>
    )
  }

  return (
    <div className="rf-alert rf-alert--danger" role="alert">
      <div>
        <strong>TaxCore rejected this invoice.</strong> {asSentence(rejection.message)} Nothing was signed. Fix the data and send it again, or delete it from the Failed list.
      </div>
    </div>
  )
}
