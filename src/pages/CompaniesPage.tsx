import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCompanies, useDeleteCompany, useSaveCompany } from '../api/hooks'
import { ApiError, errorMessage } from '../api/client'
import type { Company } from '../api/types'
import { Badge, Empty, ErrorAlert, Field, Modal, Pager, Skeleton } from '../components/ui'
import { formatDate } from '../format'

export function CompaniesPage() {
  const [page, setPage] = useState(1)
  const q = useCompanies(page)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Company | null>(null)

  return (
    <div className="stack">
      <div className="rf-page-head">
        <div>
          <h1 style={{ margin: 0 }}>Companies</h1>
          <p className="rf-muted" style={{ margin: 0 }}>Every company you fiscalize invoices for.</p>
        </div>
        <button className="rf-btn rf-btn--primary" onClick={() => setCreating(true)}>Add company</button>
      </div>

      {q.isError && <ErrorAlert error={q.error} onRetry={() => q.refetch()} />}
      {q.isLoading && <Skeleton />}
      {q.data && q.data.data.length === 0 && (
        <Empty title="No companies yet" text="Add the first company, then upload its TaxCore certificate." action={<button className="rf-btn rf-btn--primary" onClick={() => setCreating(true)}>Add company</button>} />
      )}
      {q.data && q.data.data.length > 0 && (
        <div className="rf-table-wrap">
          <table className="rf-table">
            <thead>
              <tr><th>Business name</th><th>Certificate</th><th>Created</th><th /></tr>
            </thead>
            <tbody>
              {q.data.data.map((c) => (
                <tr key={c.id}>
                  <td><Link className="rf-link" to={`/companies/${c.id}`}>{c.business_name}</Link></td>
                  <td>{c.has_usable_certificate ? <Badge cls="rf-badge--success">Valid</Badge> : <Badge cls="rf-badge--warning">Needs setup</Badge>}</td>
                  <td>{formatDate(c.created_at)}</td>
                  <td className="rf-col-num">
                    {!c.has_usable_certificate && <Link className="rf-btn rf-btn--secondary rf-btn--sm" to={`/companies/${c.id}?upload=1`}>Upload certificate</Link>}{' '}
                    <button className="rf-btn rf-btn--danger-ghost rf-btn--sm" onClick={() => setDeleting(c)}>Delete company</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pager page={q.data.meta.current_page} last={q.data.meta.last_page} total={q.data.meta.total} onPage={setPage} />
        </div>
      )}

      {creating && <CompanyForm onClose={() => setCreating(false)} />}
      {deleting && <DeleteCompany company={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}

export function CompanyForm({ company, onClose }: { company?: Company; onClose: () => void }) {
  const save = useSaveCompany(company?.id)
  const [name, setName] = useState(company?.business_name ?? '')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    save.mutate(name, { onSuccess: onClose })
  }
  const err = save.error ? (save.error instanceof ApiError ? errorMessage(save.error) : 'Could not save') : undefined
  return (
    <Modal
      title={company ? 'Rename company' : 'Add company'}
      onClose={onClose}
      foot={
        <>
          <button className="rf-btn rf-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="rf-btn rf-btn--primary" form="company-form" disabled={save.isPending || !name.trim()} aria-busy={save.isPending}>
            {company ? 'Save name' : 'Add company'}
          </button>
        </>
      }
    >
      <form id="company-form" className="form" onSubmit={submit}>
        <Field label="Business name" error={err}>
          <input className="rf-input" autoFocus value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!err} />
        </Field>
      </form>
    </Modal>
  )
}

function DeleteCompany({ company, onClose }: { company: Company; onClose: () => void }) {
  const del = useDeleteCompany()
  return (
    <Modal
      title={`Delete ${company.business_name}?`}
      onClose={onClose}
      foot={
        <>
          <button className="rf-btn rf-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="rf-btn rf-btn--danger" disabled={del.isPending} onClick={() => del.mutate(company.id, { onSuccess: onClose })}>
            {del.isPending ? 'Deleting…' : 'Delete company'}
          </button>
        </>
      }
    >
      <p>This permanently deletes the company, its certificates and all of its invoices. It cannot be undone.</p>
      {del.isError && <ErrorAlert error={del.error} />}
    </Modal>
  )
}
