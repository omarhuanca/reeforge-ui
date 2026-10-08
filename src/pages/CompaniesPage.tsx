import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCompanies, useDeleteCompany, useSaveCompany } from '../api/hooks'
import { ApiError, errorMessage } from '../api/client'
import type { Company } from '../api/types'
import { IconEdit, IconMore, IconTrash, IconUpload } from '../components/icons'
import { Menu } from '../components/Menu'
import { Badge, Empty, ErrorAlert, Field, Modal, Pager, Skeleton } from '../components/ui'
import { formatDate } from '../format'
import { UploadCertificateModal } from './UploadCertificateModal'

export function CompaniesPage() {
  const [page, setPage] = useState(1)
  const q = useCompanies(page)
  const [creating, setCreating] = useState(false)
  const [renaming, setRenaming] = useState<Company | null>(null)
  const [uploading, setUploading] = useState<Company | null>(null)
  const [deleting, setDeleting] = useState<Company | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 5000)
    return () => clearTimeout(t)
  }, [toast])

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
        <div className="rf-table-wrap rf-table-wrap--menus">
          <table className="rf-table">
            <thead>
              <tr>
                <th>Business name</th>
                <th>Certificate</th>
                <th>Created</th>
                <th style={{ width: 48 }}><span className="rf-sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {q.data.data.map((c) => (
                <tr key={c.id}>
                  <td><Link className="rf-link" to={`/companies/${c.id}`}>{c.business_name}</Link></td>
                  <td>{c.has_usable_certificate ? <Badge cls="rf-badge--success">Valid</Badge> : <Badge cls="rf-badge--warning">Needs setup</Badge>}</td>
                  <td>{formatDate(c.created_at)}</td>
                  <td className="rf-col-num">
                    <Menu label={`Actions for ${c.business_name}`} buttonClass="rf-btn rf-btn--ghost rf-icon-btn rf-btn--sm" trigger={<IconMore />}>
                      {(close) => (
                        <>
                          <button type="button" className="rf-menu__item" role="menuitem" onClick={() => { close(); setUploading(c) }}>
                            <IconUpload />Upload certificate
                          </button>
                          <button type="button" className="rf-menu__item" role="menuitem" onClick={() => { close(); setRenaming(c) }}>
                            <IconEdit />Rename company
                          </button>
                          <div className="rf-menu__sep" role="separator" />
                          <button type="button" className="rf-menu__item rf-menu__item--danger" role="menuitem" onClick={() => { close(); setDeleting(c) }}>
                            <IconTrash />Delete company
                          </button>
                        </>
                      )}
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pager page={q.data.meta.current_page} last={q.data.meta.last_page} total={q.data.meta.total} onPage={setPage} />
        </div>
      )}

      {creating && <CompanyForm onClose={() => setCreating(false)} />}
      {renaming && <CompanyForm company={renaming} onClose={() => setRenaming(null)} />}
      {uploading && <UploadCertificateModal companyId={uploading.id} onClose={() => setUploading(null)} onUploaded={() => setToast('Certificate uploaded')} />}
      {deleting && <DeleteCompany company={deleting} onClose={() => setDeleting(null)} />}
      {toast && <div className="rf-toast toast-fixed" role="status">{toast}</div>}
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
