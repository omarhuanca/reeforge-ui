import { describe, expect, it } from 'vitest'
import { buildInvoice, emptyForm, emptyLine, invoiceProblems, itemsTotal, lineTotal, newExternalId, paymentsTotal, syncPayment, toNumber, type InvoiceFormState } from './invoiceForm'

const filled = (over: Partial<InvoiceFormState> = {}): InvoiceFormState => ({
  ...emptyForm(new Date(2026, 9, 15, 16, 5, 9)),
  lines: [
    { name: 'Coffee beans 1kg', quantity: '2', unitPrice: '100', label: 'a' },
    { name: 'Mug', quantity: '1', unitPrice: '150', label: 'A' },
  ],
  payments: [{ paymentType: 'Cash', amount: '200' }, { paymentType: 'Card', amount: '150' }],
  ...over,
})

describe('invoice form', () => {
  it('builds the external id from the date', () => {
    expect(newExternalId(new Date(2026, 9, 15, 16, 5, 9))).toBe('INV-20261015-160509')
  })

  it('reads numbers with a decimal comma and treats the rest as NaN', () => {
    expect(toNumber('12,5')).toBe(12.5)
    expect(toNumber(' 3 ')).toBe(3)
    expect(Number.isNaN(toNumber(''))).toBe(true)
    expect(Number.isNaN(toNumber('abc'))).toBe(true)
  })

  it('totals a line as quantity × unit price, to 4 decimals', () => {
    expect(lineTotal({ name: 'x', quantity: '3', unitPrice: '0.1', label: 'A' })).toBe(0.3)
    expect(lineTotal({ name: 'x', quantity: '', unitPrice: '5', label: 'A' })).toBe(0)
  })

  it('adds up items and payments', () => {
    expect(itemsTotal(filled())).toBe(350)
    expect(paymentsTotal(filled())).toBe(350)
  })

  it('builds the request the API takes: totals computed, labels upper-cased, referent only for a refund', () => {
    const body = buildInvoice(filled({ externalId: ' UI-1 ' }))
    expect(body).toEqual({
      external_id: 'UI-1',
      invoice: {
        invoiceType: 'Normal',
        transactionType: 'Sale',
        payment: [{ amount: 200, paymentType: 'Cash' }, { amount: 150, paymentType: 'Card' }],
        items: [
          { name: 'Coffee beans 1kg', quantity: 2, unitPrice: 100, labels: ['A'], totalAmount: 200 },
          { name: 'Mug', quantity: 1, unitPrice: 150, labels: ['A'], totalAmount: 150 },
        ],
      },
    })
    expect('referentDocumentNumber' in body.invoice).toBe(false)

    const refund = buildInvoice(filled({ transactionType: 'Refund', referentDocumentNumber: ' 5VPJ-24 ', buyerId: '123', cashier: ' Ana ' }))
    expect(refund.invoice).toMatchObject({ transactionType: 'Refund', referentDocumentNumber: '5VPJ-24', buyerId: '123', cashier: 'Ana' })
  })

  it('a form that is ready has no problems', () => {
    expect(invoiceProblems(filled())).toEqual([])
  })

  it('names what is missing, line by line', () => {
    const form = filled({ lines: [{ ...emptyLine(), name: '', unitPrice: '' }], payments: [{ paymentType: 'Cash', amount: '' }] })
    expect(invoiceProblems(form)).toEqual([
      'Line 1: the item name is required.',
      'Line 1: enter the unit price.',
      'Payment 1: enter the amount.',
    ])
  })

  it('a refund needs the referent and a xero: id is refused', () => {
    expect(invoiceProblems(filled({ transactionType: 'Refund' }))).toContain('A refund needs the number of the invoice it refunds.')
    expect(invoiceProblems(filled({ externalId: 'xero:abc' }))).toContain('External IDs starting with "xero:" belong to Xero.')
    expect(invoiceProblems(filled({ externalId: '  ' }))).toContain('The external ID is required.')
  })

  it('payments that do not match the items are explained, within a cent', () => {
    expect(invoiceProblems(filled({ payments: [{ paymentType: 'Cash', amount: '300' }] }))).toEqual(['The payments add up to 300, but the items add up to 350.'])
    expect(invoiceProblems(filled({ payments: [{ paymentType: 'Cash', amount: '350.01' }] }))).toEqual([])
  })

  it('a single untouched payment follows the items total; a typed one does not', () => {
    const form = { ...emptyForm(), lines: [{ name: 'x', quantity: '2', unitPrice: '115', label: 'A' }] }
    expect(syncPayment(form).payments[0].amount).toBe('230')
    const touched = { ...form, paymentTouched: true, payments: [{ paymentType: 'Cash', amount: '10' }] }
    expect(syncPayment(touched).payments[0].amount).toBe('10')
    const split = { ...form, payments: [{ paymentType: 'Cash', amount: '1' }, { paymentType: 'Card', amount: '2' }] }
    expect(syncPayment(split)).toBe(split)
  })
})
