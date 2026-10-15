/**
 * The invoice form and the TaxCore InvoiceRequest (v3) nexo-bk expects under "invoice".
 * Pure logic: the amounts are checked here with the same rules the API applies (nexo-bk
 * InvoicePayloadRules), so the form explains a problem before the request is sent.
 */

export const INVOICE_TYPES = ['Normal', 'ProForma', 'Copy', 'Training', 'Advance'] as const
export type InvoiceType = (typeof INVOICE_TYPES)[number]

export const TRANSACTION_TYPES = ['Sale', 'Refund'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export interface LineForm {
  name: string
  quantity: string
  unitPrice: string
  label: string
}

export interface PaymentForm {
  paymentType: string
  amount: string
}

export interface InvoiceFormState {
  externalId: string
  invoiceType: InvoiceType
  transactionType: TransactionType
  referentDocumentNumber: string
  buyerId: string
  cashier: string
  lines: LineForm[]
  payments: PaymentForm[]
  /** Once the amount of the only payment is typed by hand, it stops following the items total. */
  paymentTouched: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

/** A readable id that is unique per second; resending the same id with the same data returns the saved invoice. */
export function newExternalId(now = new Date()): string {
  return `INV-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

export const emptyLine = (): LineForm => ({ name: '', quantity: '1', unitPrice: '', label: 'A' })

export function emptyForm(now = new Date()): InvoiceFormState {
  return {
    externalId: newExternalId(now),
    invoiceType: 'Normal',
    transactionType: 'Sale',
    referentDocumentNumber: '',
    buyerId: '',
    cashier: '',
    lines: [emptyLine()],
    payments: [{ paymentType: 'Cash', amount: '' }],
    paymentTouched: false,
  }
}

/** A typed number, or NaN when it is empty or not a number. */
export function toNumber(text: string): number {
  const t = text.trim().replace(',', '.')
  return t === '' ? NaN : Number(t)
}

/** Like the API: quantity × unit price, to 4 decimals. */
export function lineTotal(line: LineForm): number {
  const total = toNumber(line.quantity) * toNumber(line.unitPrice)
  return Number.isFinite(total) ? Math.round(total * 10_000) / 10_000 : 0
}

export const itemsTotal = (form: InvoiceFormState): number =>
  Math.round(form.lines.reduce((sum, l) => sum + lineTotal(l), 0) * 10_000) / 10_000

export const paymentsTotal = (form: InvoiceFormState): number =>
  Math.round(form.payments.reduce((sum, p) => sum + (Number.isFinite(toNumber(p.amount)) ? toNumber(p.amount) : 0), 0) * 10_000) / 10_000

const text = (n: number) => String(Math.round(n * 100) / 100)

/** Keeps a single, untouched payment equal to the items total, so the common case needs no typing. */
export function syncPayment(form: InvoiceFormState): InvoiceFormState {
  if (form.paymentTouched || form.payments.length !== 1) return form
  const total = itemsTotal(form)
  return { ...form, payments: [{ ...form.payments[0], amount: total > 0 ? text(total) : '' }] }
}

/** What stops the invoice from being sent, in the order the form is filled. Empty when it can be sent. */
export function invoiceProblems(form: InvoiceFormState): string[] {
  const problems: string[] = []
  const id = form.externalId.trim()

  if (!id) problems.push('The external ID is required.')
  else if (id.length > 100) problems.push('The external ID is at most 100 characters.')
  else if (id.startsWith('xero:')) problems.push('External IDs starting with "xero:" belong to Xero.')

  if (form.transactionType === 'Refund' && !form.referentDocumentNumber.trim()) {
    problems.push('A refund needs the number of the invoice it refunds.')
  }
  if (form.buyerId.trim().length > 20) problems.push('The buyer ID is at most 20 characters.')
  if (form.cashier.trim().length > 50) problems.push('The cashier is at most 50 characters.')

  form.lines.forEach((l, i) => {
    const n = i + 1
    if (!l.name.trim()) problems.push(`Line ${n}: the item name is required.`)
    if (!(toNumber(l.quantity) > 0)) problems.push(`Line ${n}: the quantity must be greater than 0.`)
    if (!(toNumber(l.unitPrice) >= 0)) problems.push(`Line ${n}: enter the unit price.`)
    const label = l.label.trim()
    if (label.length < 1 || label.length > 2) problems.push(`Line ${n}: the tax label has 1 or 2 characters.`)
  })

  form.payments.forEach((p, i) => {
    if (!p.paymentType) problems.push(`Payment ${i + 1}: choose the payment type.`)
    if (!(toNumber(p.amount) >= 0)) problems.push(`Payment ${i + 1}: enter the amount.`)
  })

  const items = itemsTotal(form)
  const paid = paymentsTotal(form)
  if (problems.length === 0 && Math.abs(items - paid) > 0.01) {
    problems.push(`The payments add up to ${text(paid)}, but the items add up to ${text(items)}.`)
  }
  return problems
}

export interface InvoiceRequestBody {
  external_id: string
  invoice: {
    invoiceType: InvoiceType
    transactionType: TransactionType
    referentDocumentNumber?: string
    buyerId?: string
    cashier?: string
    payment: { amount: number; paymentType: string }[]
    items: { name: string; quantity: number; unitPrice: number; labels: string[]; totalAmount: number }[]
  }
}

/** The request body. Optional fields are left out when empty; the referent only goes with a refund. */
export function buildInvoice(form: InvoiceFormState): InvoiceRequestBody {
  const optional = (value: string) => (value.trim() ? value.trim() : undefined)
  return {
    external_id: form.externalId.trim(),
    invoice: {
      invoiceType: form.invoiceType,
      transactionType: form.transactionType,
      ...(form.transactionType === 'Refund' && { referentDocumentNumber: form.referentDocumentNumber.trim() }),
      ...(optional(form.buyerId) && { buyerId: optional(form.buyerId) }),
      ...(optional(form.cashier) && { cashier: optional(form.cashier) }),
      payment: form.payments.map((p) => ({ amount: toNumber(p.amount), paymentType: p.paymentType })),
      items: form.lines.map((l) => ({
        name: l.name.trim(),
        quantity: toNumber(l.quantity),
        unitPrice: toNumber(l.unitPrice),
        labels: [l.label.trim().toUpperCase()],
        totalAmount: lineTotal(l),
      })),
    },
  }
}
