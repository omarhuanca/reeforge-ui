import type { InvoiceStatus } from '../api/types'

export const STATUS_BADGE: Record<InvoiceStatus, { cls: string; label: string }> = {
  fiscalized: { cls: 'rf-badge--success', label: 'Fiscalized' },
  pending: { cls: 'rf-badge--warning', label: 'Pending' },
  failed: { cls: 'rf-badge--danger', label: 'Failed' },
}
