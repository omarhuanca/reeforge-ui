/** Currency format of the design system: "VT 23 000" (vatu, no decimals, space as thousands separator). */
export function formatVT(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—'
  return 'VT ' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

/** Whole days from `now` to `iso` (negative when past). */
export function daysUntil(iso: string, now = new Date()): number {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000)
}

/** Parses the tax labels textarea: one "XERO_TAX_TYPE=LABEL" per line. */
export function parseTaxLabels(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const [k, v] = line.split('=').map((s) => s.trim())
    if (k && v) out[k] = v
  }
  return out
}

export const stringifyTaxLabels = (labels: Record<string, string>) =>
  Object.entries(labels)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')
