import { describe, expect, it } from 'vitest'
import { canDeleteInvoice } from './invoices'

describe('canDeleteInvoice', () => {
  it('allows only a failed invoice whose error is not retryable', () => {
    expect(canDeleteInvoice({ status: 'failed', error: { retryable: false } })).toBe(true)
  })
  it('refuses a retryable failure or one without a stated reason', () => {
    expect(canDeleteInvoice({ status: 'failed', error: { retryable: true } })).toBe(false)
    expect(canDeleteInvoice({ status: 'failed', error: { message: 'x' } })).toBe(false)
    expect(canDeleteInvoice({ status: 'failed', error: null })).toBe(false)
  })
  it('never allows a fiscalized or pending invoice', () => {
    expect(canDeleteInvoice({ status: 'fiscalized', error: null })).toBe(false)
    expect(canDeleteInvoice({ status: 'pending', error: { retryable: false } })).toBe(false)
  })
})
