import { describe, expect, it } from 'vitest'
import type { Certificate } from '../api/types'
import { isLastUsable } from './certificates'

const cert = (id: number, usable: boolean): Certificate => ({
  id,
  uid: `UID${id}`,
  environment: 'sandbox',
  common_name: 'Test',
  organization: null,
  vsdc_url: 'https://vsdc.example',
  valid_from: '2026-01-01T00:00:00Z',
  valid_to: '2029-01-01T00:00:00Z',
  revoked_at: null,
  usable,
})

describe('isLastUsable', () => {
  it('is true for the only valid certificate', () => {
    expect(isLastUsable([cert(1, true), cert(2, false)], 1)).toBe(true)
  })
  it('is false when another valid certificate remains', () => {
    expect(isLastUsable([cert(1, true), cert(2, true)], 1)).toBe(false)
  })
  it('is false for an expired or revoked certificate, and for an unknown id', () => {
    expect(isLastUsable([cert(1, true), cert(2, false)], 2)).toBe(false)
    expect(isLastUsable([cert(1, true)], 99)).toBe(false)
  })
})
