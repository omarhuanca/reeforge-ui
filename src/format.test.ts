import { describe, expect, it } from 'vitest'
import { daysUntil, formatVT, parseTaxLabels, stringifyTaxLabels } from './format'

describe('format', () => {
  it('formats vatu with space thousands and no decimals', () => {
    expect(formatVT(23000)).toBe('VT 23 000')
    expect(formatVT(1234567.6)).toBe('VT 1 234 568')
    expect(formatVT(0)).toBe('VT 0')
    expect(formatVT(null)).toBe('—')
  })

  it('counts days until a date', () => {
    expect(daysUntil('2026-10-17T00:00:00Z', new Date('2026-10-07T00:00:00Z'))).toBe(10)
    expect(daysUntil('2026-10-01T00:00:00Z', new Date('2026-10-07T00:00:00Z'))).toBe(-6)
  })

  it('round-trips tax labels', () => {
    const labels = parseTaxLabels('OUTPUT=A\n EXEMPTOUTPUT = B \n\nbad')
    expect(labels).toEqual({ OUTPUT: 'A', EXEMPTOUTPUT: 'B' })
    expect(parseTaxLabels(stringifyTaxLabels(labels))).toEqual(labels)
  })
})
