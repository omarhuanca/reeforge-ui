import { describe, expect, it } from 'vitest'
import { ApiError } from './client'
import { asSentence, taxCoreRejection } from './taxcore'

const failed = (status: number, error: unknown) => new ApiError(status, `Request failed (${status})`, {}, { data: { error } })

describe('taxCoreRejection', () => {
  it('reads the reason of an invoice TaxCore rejected for good (422)', () => {
    expect(taxCoreRejection(failed(422, { message: 'Bad Request', retryable: false }))).toEqual({ message: 'Bad Request', retryable: false })
  })
  it('flags a TaxCore that did not answer (503) as retryable', () => {
    expect(taxCoreRejection(failed(503, { message: 'V-SDC unreachable', retryable: true }))).toEqual({ message: 'V-SDC unreachable', retryable: true })
  })
  it('falls back when TaxCore gave no reason', () => {
    expect(taxCoreRejection(failed(422, { retryable: false }))?.message).toBe('TaxCore gave no reason.')
    expect(taxCoreRejection(failed(422, { message: '  ' }))?.message).toBe('TaxCore gave no reason.')
  })
  it('ignores ordinary errors: validation, conflicts and anything that is not an ApiError', () => {
    expect(taxCoreRejection(new ApiError(422, 'The given data was invalid.', { 'invoice.items': ['required'] }, { message: 'x' }))).toBeNull()
    expect(taxCoreRejection(failed(409, { message: 'x' }))).toBeNull()
    expect(taxCoreRejection(new Error('boom'))).toBeNull()
  })
})

describe('asSentence', () => {
  it('adds a full stop only when the text has none', () => {
    expect(asSentence('Bad Request')).toBe('Bad Request.')
    expect(asSentence('V-SDC unreachable. ')).toBe('V-SDC unreachable.')
    expect(asSentence('Invalid label!')).toBe('Invalid label.')
  })
})
