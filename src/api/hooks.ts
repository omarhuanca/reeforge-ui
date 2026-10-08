import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from './client'
import type {
  Certificate,
  Company,
  Invoice,
  NewToken,
  Paginated,
  XeroConnection,
  XeroPending,
} from './types'

// ---- Auth
export const login = (email: string, password: string) =>
  api<{ data: NewToken }>('/auth/login', { method: 'POST', body: { email, password }, auth: false })

export const logout = () => api('/auth/token', { method: 'DELETE' })

// ---- Companies
export const useCompanies = (page = 1) =>
  useQuery({ queryKey: ['companies', page], queryFn: () => api<Paginated<Company>>(`/companies?page=${page}`) })

export const useCompany = (id: number) =>
  useQuery({ queryKey: ['company', id], queryFn: () => api<{ data: Company }>(`/companies/${id}`).then((r) => r.data) })

export function useSaveCompany(id?: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (business_name: string) =>
      id
        ? api<{ data: Company }>(`/companies/${id}`, { method: 'PATCH', body: { business_name } })
        : api<{ data: Company }>('/companies', { method: 'POST', body: { business_name } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      qc.invalidateQueries({ queryKey: ['company'] })
    },
  })
}

export function useDeleteCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api(`/companies/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  })
}

// ---- Certificates
export const useCertificates = (companyId: number) =>
  useQuery({
    queryKey: ['certificates', companyId],
    queryFn: () => api<{ data: Certificate[] }>(`/companies/${companyId}/certificates`).then((r) => r.data),
  })

export function useUploadCertificate(companyId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) =>
      api<{ data: Certificate }>(`/companies/${companyId}/certificates`, { method: 'POST', form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates', companyId] })
      qc.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

// ---- Invoices
export const useInvoices = (companyId: number, page: number, status: string) =>
  useQuery({
    queryKey: ['invoices', companyId, page, status],
    queryFn: () =>
      api<Paginated<Invoice>>(
        `/companies/${companyId}/invoices?page=${page}&per_page=20${status ? `&status=${status}` : ''}`,
      ),
  })

/** Totals per status for the filter counters: one single-row request each, read from meta.total. */
export const INVOICE_COUNT_STATUSES = ['', 'fiscalized', 'pending', 'failed'] as const

export const useInvoiceCounts = (companyId: number) =>
  useQueries({
    queries: INVOICE_COUNT_STATUSES.map((status) => ({
      queryKey: ['invoices', companyId, 'count', status],
      queryFn: () =>
        api<Paginated<Invoice>>(`/companies/${companyId}/invoices?per_page=1${status ? `&status=${status}` : ''}`).then(
          (r) => r.meta.total,
        ),
    })),
    combine: (results) =>
      Object.fromEntries(INVOICE_COUNT_STATUSES.map((s, i) => [s, results[i].data])) as Record<
        (typeof INVOICE_COUNT_STATUSES)[number],
        number | undefined
      >,
  })

export const useInvoice = (companyId: number, id: number | null) =>
  useQuery({
    queryKey: ['invoice', companyId, id],
    enabled: id !== null,
    queryFn: () => api<{ data: Invoice }>(`/companies/${companyId}/invoices/${id}`).then((r) => r.data),
  })

export function useCreateInvoice(companyId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: unknown) =>
      api<{ data: Invoice }>(`/companies/${companyId}/invoices`, { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices', companyId] }),
  })
}

// ---- Xero
export const useXero = (companyId: number) =>
  useQuery({
    queryKey: ['xero', companyId],
    retry: false,
    queryFn: async () => {
      try {
        return (await api<{ data: XeroConnection }>(`/companies/${companyId}/xero`)).data
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null // not connected yet
        throw e
      }
    },
  })

export const useXeroPending = (companyId: number, enabled: boolean) =>
  useQuery({
    queryKey: ['xero-pending', companyId],
    enabled,
    queryFn: () => api<{ data: XeroPending[] }>(`/companies/${companyId}/xero/pending`).then((r) => r.data),
  })

export const useXeroLink = (companyId: number) =>
  useMutation({
    mutationFn: () => api<{ url: string; expires_at?: string }>(`/companies/${companyId}/xero/connect-link`, { method: 'POST' }),
  })

export function useXeroSettings(companyId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { tax_labels: Record<string, string>; payment_type: string }) =>
      api(`/companies/${companyId}/xero/settings`, { method: 'PUT', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['xero', companyId] }),
  })
}

export function useXeroDisconnect(companyId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api(`/companies/${companyId}/xero`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['xero', companyId] }),
  })
}
