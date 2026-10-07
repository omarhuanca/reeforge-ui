// Shapes returned by nexo-bk (app/Http/Resources/*).

export interface NewToken {
  id: number
  token: string
  name: string
  abilities: string[]
  expires_at: string | null
}

export interface Company {
  id: number
  business_name: string
  has_usable_certificate: boolean
  created_at: string
}

export interface Certificate {
  id: number
  uid: string
  environment: string
  common_name: string
  organization: string | null
  vsdc_url: string
  valid_from: string
  valid_to: string
  revoked_at: string | null
  usable: boolean
}

export type InvoiceStatus = 'pending' | 'fiscalized' | 'failed'

export interface Invoice {
  id: number
  external_id: string
  company_id: number
  certificate_id: number | null
  certificate: { uid: string; location: string; environment: string } | null
  status: InvoiceStatus
  attempts: number
  request_id: string | null
  invoice_number: string | null
  sdc_date_time: string | null
  total_amount: number | null
  verification_url: string | null
  journal?: string | null
  verification_qr?: string | null
  error: { message?: string; retryable?: boolean; [k: string]: unknown } | null
  warning: string | null
  xero_synced_at: string | null
  fiscalized_at: string | null
  created_at: string
}

export interface XeroConnection {
  company_id: number
  tenant_id: string
  tenant_name: string | null
  tax_labels: Record<string, string>
  payment_type: string | null
  configured: boolean
  reconciled_at: string | null
  connected_at: string
}

export interface XeroPending {
  xero_type: string
  xero_id: string
  number: string | null
  reason: string
  last_attempt_at: string
  first_seen_at: string
}

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number; per_page: number }
}

export const XERO_PAYMENT_TYPES = ['Other', 'Cash', 'Card', 'Check', 'WireTransfer', 'Voucher', 'MobileMoney'] as const
