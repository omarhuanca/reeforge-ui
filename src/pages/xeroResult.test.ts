import { describe, expect, it } from 'vitest'
import { xeroResult } from './xeroResult'

describe('xeroResult', () => {
  it('only "connected" is a success', () => {
    expect(xeroResult('connected').ok).toBe(true)
    for (const s of ['expired', 'denied', 'unavailable', 'organisations', 'taken', 'channel']) expect(xeroResult(s).ok).toBe(false)
  })

  it('treats unknown, missing or inherited keys as a generic failure', () => {
    for (const s of ['nope', '', null, 'constructor', '__proto__']) {
      expect(xeroResult(s)).toMatchObject({ ok: false, title: 'Connection not completed' })
    }
  })
})
