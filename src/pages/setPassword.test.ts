import { describe, expect, it } from 'vitest'
import { passwordProblem, readLink, setPasswordCopy } from './setPassword'

describe('readLink', () => {
  it('reads the token and the email of the emailed link', () => {
    expect(readLink(new URLSearchParams('token=abc123&email=jane%40acme.test'))).toEqual({ token: 'abc123', email: 'jane@acme.test' })
  })

  it('refuses a link without token or email', () => {
    for (const q of ['', 'token=abc', 'email=jane%40acme.test', 'token=%20&email=jane%40acme.test']) {
      expect(readLink(new URLSearchParams(q))).toBeNull()
    }
  })
})

describe('passwordProblem', () => {
  it('needs 8 characters and the same password twice', () => {
    expect(passwordProblem('short', 'short')).toBe('Use at least 8 characters.')
    expect(passwordProblem('long-enough', 'long-enougH')).toBe('The two passwords do not match.')
    expect(passwordProblem('long-enough', 'long-enough')).toBeNull()
  })
})

describe('setPasswordCopy', () => {
  it('posts each kind of link to its own endpoint', () => {
    expect(setPasswordCopy.invitation.endpoint).toBe('/auth/invitation/accept')
    expect(setPasswordCopy.reset.endpoint).toBe('/auth/password/reset')
  })
})
