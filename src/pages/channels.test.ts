import { describe, expect, it } from 'vitest'
import { ApiError } from '../api/client'
import { canFiscalizeByHand, switchRefusal, tabsFor, visibleTab } from './channels'

describe('channels', () => {
  it('only a xero company has the Xero tab', () => {
    expect(tabsFor('xero')).toEqual(['invoices', 'certificates', 'xero'])
    expect(tabsFor('taxcore')).toEqual(['invoices', 'certificates'])
  })

  it('falls back to the invoices when the requested tab does not exist for the channel', () => {
    expect(visibleTab('xero', 'taxcore')).toBe('invoices')
    expect(visibleTab('xero', 'xero')).toBe('xero')
    expect(visibleTab('nope', 'xero')).toBe('invoices')
    expect(visibleTab(null, 'taxcore')).toBe('invoices')
  })

  it('fiscalizes by hand only through taxcore', () => {
    expect(canFiscalizeByHand('taxcore')).toBe(true)
    expect(canFiscalizeByHand('xero')).toBe(false)
  })

  it('reads the reason and the invoices to resend from a 409', () => {
    const body = { message: 'Worth It Ltd has invoices that may still get signed.', external_ids: ['POS-1', 'POS-2'] }
    expect(switchRefusal(new ApiError(409, body.message, {}, body))).toEqual({ message: body.message, externalIds: ['POS-1', 'POS-2'] })
  })

  it('a 409 without invoices (Xero still connected) has no ids; other errors are not refusals', () => {
    expect(switchRefusal(new ApiError(409, 'Disconnect Xero first.', {}, { message: 'Disconnect Xero first.' }))).toEqual({ message: 'Disconnect Xero first.', externalIds: [] })
    expect(switchRefusal(new ApiError(422, 'Invalid', {}, null))).toBeNull()
    expect(switchRefusal(new Error('x'))).toBeNull()
  })
})
