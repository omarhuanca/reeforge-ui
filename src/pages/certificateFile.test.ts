import { describe, expect, it } from 'vitest'
import { validateCertificateFile } from './certificateFile'

describe('validateCertificateFile', () => {
  it('accepts p12 and pfx up to 100 KB', () => {
    expect(validateCertificateFile({ name: 'pos.p12', size: 102_400 })).toBeUndefined()
    expect(validateCertificateFile({ name: 'POS.PFX', size: 10 })).toBeUndefined()
  })
  it('rejects other extensions and files over the limit', () => {
    expect(validateCertificateFile({ name: 'pos.pem', size: 10 })).toMatch(/\.p12/)
    expect(validateCertificateFile({ name: 'pos.p12', size: 102_401 })).toMatch(/100 KB/)
  })
})
