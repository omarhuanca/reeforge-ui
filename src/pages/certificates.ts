import type { Certificate } from '../api/types'

/** True when deleting this certificate leaves the company without any valid one. */
export function isLastUsable(certificates: Certificate[], id: number): boolean {
  const target = certificates.find((c) => c.id === id)
  if (!target?.usable) return false
  return certificates.filter((c) => c.usable).length === 1
}
