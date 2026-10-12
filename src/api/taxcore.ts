import { ApiError } from './client'

export interface TaxCoreRejection {
  message: string
  /** True when TaxCore did not answer (503): the invoice may have been signed, so only the same data may be resent. */
  retryable: boolean
}

/**
 * nexo-bk answers a rejected invoice with the failed invoice itself (422, or 503 when TaxCore did not
 * answer), not with a Laravel error: the reason lives in data.error.message.
 */
export function taxCoreRejection(error: unknown): TaxCoreRejection | null {
  if (!(error instanceof ApiError) || (error.status !== 422 && error.status !== 503)) return null
  const err = (error.body as { data?: { error?: { message?: unknown; retryable?: unknown } | null } } | null)?.data?.error
  if (!err) return null
  return {
    message: typeof err.message === 'string' && err.message.trim() ? err.message : 'TaxCore gave no reason.',
    retryable: err.retryable === true,
  }
}

/** Ends a reason with a full stop (TaxCore's messages come without one) so it reads well before the next sentence. */
export function asSentence(text: string): string {
  return text.trim().replace(/[.!?…]+$/, '') + '.'
}
