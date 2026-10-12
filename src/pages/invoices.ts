import type { Invoice } from '../api/types'

/**
 * Same rule as nexo-bk: only an invoice TaxCore rejected for good was never signed.
 * Fiscalized, pending and retryable failures may be (or become) signed, so they are never deleted.
 */
export function canDeleteInvoice(invoice: Pick<Invoice, 'status' | 'error'>): boolean {
  return invoice.status === 'failed' && invoice.error?.retryable === false
}
