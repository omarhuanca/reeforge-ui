import { describe, expect, it } from 'vitest'
import { buildInvoice, canAddLine, defaultTaxLabel, emptyForm, emptyLine, formFromJson, invoiceProblems, itemsTotal, lineProblems, lineTotal, newExternalId, paymentsTotal, syncPayment, taxRateText, toJsonText, toNumber, withTaxLabels, type InvoiceFormState } from './invoiceForm'

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

  it('what the form holds survives the trip to JSON and back', () => {
    const form = filled({ externalId: 'UI-1', transactionType: 'Refund', referentDocumentNumber: '5VPJ-24', buyerId: '77' })
    const back = formFromJson(toJsonText(form))
    expect(back?.dropped).toEqual([])
    expect(buildInvoice(back!.form)).toEqual(buildInvoice(form))
  })

  it('lists what the form cannot hold instead of silently dropping it', () => {
    const json = JSON.stringify({
      external_id: 'X-1',
      note: 'hello',
      invoice: {
        invoiceType: 'Normal',
        transactionType: 'Sale',
        dateAndTimeOfIssue: '2026-10-15T10:00:00',
        payment: [{ amount: 90, paymentType: 'Cash', vouchers: 1 }],
        items: [{ name: 'Tea', quantity: 1, unitPrice: 100, labels: ['A', 'B'], totalAmount: 90, discount: 10, gtin: '123' }],
      },
    })
    const result = formFromJson(json)
    expect(result?.dropped.sort()).toEqual([
      'invoice.dateAndTimeOfIssue',
      'items.discount',
      'items.gtin',
      'items.labels (only the first is kept)',
      'note',
      'payment.vouchers',
    ])
    expect(result?.form.lines[0]).toEqual({ name: 'Tea', quantity: '1', unitPrice: '100', label: 'A' })
  })

  it('text that is not an invoice object is refused', () => {
    expect(formFromJson('not json')).toBeNull()
    expect(formFromJson('[]')).toBeNull()
    expect(formFromJson('{"external_id":"x"}')).toBeNull()
  })

  it('a unit price of 0 is valid (a free item); a negative or non-numeric one is refused, with its own message from an empty one', () => {
    const one = (unitPrice: string) => ({ name: 'x', quantity: '1', unitPrice, label: 'A' })
    expect(lineProblems(one('0'), 1)).toEqual([])
    expect(lineProblems(one('0.01'), 1)).toEqual([])
    expect(lineProblems(one('-5'), 1)).toEqual(['Line 1: the unit price cannot be negative.'])
    expect(lineProblems(one('abc'), 1)).toEqual(['Line 1: the unit price cannot be negative.'])
    expect(lineProblems(one(''), 1)).toEqual(['Line 1: enter the unit price.'])
  })

  it('a quantity of 0 or less is refused', () => {
    for (const quantity of ['0', '-1', '', 'x']) {
      expect(lineProblems({ name: 'x', quantity, unitPrice: '10', label: 'A' }, 2)).toEqual(['Line 2: the quantity must be greater than 0.'])
    }
  })

  it('an invoice with a free item can be sent, and the item goes out with price 0', () => {
    const form = filled({
      lines: [
        { name: 'Mug', quantity: '1', unitPrice: '150', label: 'A' },
        { name: 'Free sample', quantity: '1', unitPrice: '0', label: 'A' },
      ],
      payments: [{ paymentType: 'Cash', amount: '150' }],
    })
    expect(invoiceProblems(form)).toEqual([])
    expect(buildInvoice(form).invoice.items[1]).toEqual({ name: 'Free sample', quantity: 1, unitPrice: 0, labels: ['A'], totalAmount: 0 })
  })

  it('a line can be added only when every line so far is complete', () => {
    expect(canAddLine(emptyForm())).toBe(false)
    expect(canAddLine(filled())).toBe(true)
    const incomplete = (patch: Partial<InvoiceFormState['lines'][number]>) => filled({ lines: [{ name: 'Mug', quantity: '1', unitPrice: '150', label: 'A' }, { ...emptyLine(), name: 'Tea', unitPrice: '10', ...patch }] })
    expect(canAddLine(incomplete({}))).toBe(true)
    expect(canAddLine(incomplete({ name: ' ' }))).toBe(false)
    expect(canAddLine(incomplete({ quantity: '0' }))).toBe(false)
    expect(canAddLine(incomplete({ unitPrice: '0' }))).toBe(true)
    expect(canAddLine(incomplete({ unitPrice: '' }))).toBe(false)
    expect(canAddLine(incomplete({ unitPrice: '-1' }))).toBe(false)
  })

  it('a new line starts on "A" when TaxCore offers it, else on the first label, and on "A" when none is known', () => {
    expect(defaultTaxLabel(['B', 'A', 'D'])).toBe('A')
    expect(defaultTaxLabel(['D', 'B'])).toBe('D')
    expect(defaultTaxLabel([])).toBe('A')
    expect(defaultTaxLabel(null)).toBe('A')
  })

  it('moves a line off a label TaxCore does not offer, and leaves a good form and an unknown list alone', () => {
    const form = filled({ lines: [{ name: 'x', quantity: '1', unitPrice: '10', label: 'A' }, { name: 'y', quantity: '1', unitPrice: '10', label: 'N' }] })
    const moved = withTaxLabels(form, ['B', 'N'])
    expect(moved.lines.map((l) => l.label)).toEqual(['B', 'N'])
    expect(withTaxLabels(form, ['A', 'N'])).toBe(form)
    expect(withTaxLabels(form, null)).toBe(form)
    expect(withTaxLabels(form, [])).toBe(form)
  })

  it('writes a rate as its label and percentage', () => {
    expect(taxRateText({ label: 'A', category: 'VAT', rate: 9 })).toBe('A · 9%')
    expect(taxRateText({ label: 'D', category: 'Excise', rate: 15.5 })).toBe('D · 15.5%')
    expect(taxRateText({ label: 'B', category: '', rate: 0 })).toBe('B · 0%')
    expect(taxRateText({ label: 'E', category: 'VAT', rate: 12.345 })).toBe('E · 12.35%')
  })
})
