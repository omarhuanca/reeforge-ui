import { ApiError } from '../api/client'
import type { Channel } from '../api/types'

export type CompanyTab = 'invoices' | 'certificates' | 'xero'

/** The Xero tab only exists for a company that fiscalizes through Xero: its endpoints answer 409 otherwise. */
export function tabsFor(channel: Channel): CompanyTab[] {
  return channel === 'xero' ? ['invoices', 'certificates', 'xero'] : ['invoices', 'certificates']
}

/** A xero company gets its invoices from Xero; POST /invoices answers 409 for it. */
export function canFiscalizeByHand(channel: Channel): boolean {
  return channel === 'taxcore'
}

/** The tab to show: the requested one if this channel has it, else the invoices. */
export function visibleTab(requested: string | null, channel: Channel): CompanyTab {
  return tabsFor(channel).find((t) => t === requested) ?? 'invoices'
}

export interface SwitchRefusal {
  message: string
  externalIds: string[]
}

/** A refused channel switch (409): why, and the invoices that must be resent first, if any. Null for any other error. */
export function switchRefusal(error: unknown): SwitchRefusal | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null
  const body = error.body as { external_ids?: unknown } | null
  const ids = Array.isArray(body?.external_ids) ? body.external_ids.filter((x): x is string => typeof x === 'string') : []
  return { message: error.message, externalIds: ids }
}
