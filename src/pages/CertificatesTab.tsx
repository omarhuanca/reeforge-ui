import { useRef, useState, type FormEvent } from 'react'
import { useCertificates, useUploadCertificate } from '../api/hooks'
import { ApiError } from '../api/client'
import type { Certificate } from '../api/types'
import { Badge, Empty, ErrorAlert, Field, Skeleton } from '../components/ui'
import { validateCertificateFile } from './certificateFile'
import { daysUntil, formatDate } from '../format'

function certBadge(c: Certificate) {
  if (c.revoked_at) return <Badge cls="rf-badge--danger">Revoked</Badge>
  const days = daysUntil(c.valid_to)
  if (days < 0) return <Badge cls="rf-badge--neutral">Expired</Badge>
  if (days <= 30) return <Badge cls="rf-badge--warning">Expires in {days} days</Badge>
  return <Badge cls="rf-badge--success">Valid</Badge>
}

export function CertificatesTab({ companyId }: { companyId: number }) {
  const q = useCertificates(companyId)
  const upload = useUploadCertificate(companyId)
  const fileRef = useRef<HTMLInputElement>(null)
  const [password, setPassword] = useState('')
  const [pac, setPac] = useState('')
  const [done, setDone] = useState(false)
  const [fileError, setFileError] = useState<string>()

  function submit(e: FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    setDone(false)
    if (!file) return
    const problem = validateCertificateFile(file)
    setFileError(problem)
    if (problem) return
    const form = new FormData()
    form.append('certificate', file)
    form.append('password', password)
    form.append('pac', pac)
    upload.mutate(form, {
      onSuccess: () => {
        setDone(true)
        setPassword('')
        setPac('')
        if (fileRef.current) fileRef.current.value = ''
      },
    })
  }

  const fieldErrors = upload.error instanceof ApiError ? upload.error.errors : {}
  const generic = upload.error && !Object.keys(fieldErrors).length ? (upload.error as Error).message : undefined

  return (
    <div className="stack">
      {q.isError && <ErrorAlert error={q.error} onRetry={() => q.refetch()} />}
      {q.isLoading && <Skeleton />}
      {q.data && q.data.length === 0 && <Empty title="No certificates" text="Upload the .p12 file TaxCore gave you for this company's business location." />}
      {q.data && q.data.length > 0 && (
        <div className="rf-table-wrap">
          <table className="rf-table">
            <thead>
              <tr><th>Location</th><th>UID</th><th>Environment</th><th>Status</th><th>Valid until</th></tr>
            </thead>
            <tbody>
              {q.data.map((c) => (
                <tr key={c.id}>
                  <td>{c.common_name}</td>
                  <td className="rf-col-id">{c.uid}</td>
                  <td>{c.environment}</td>
                  <td>{certBadge(c)}</td>
                  <td>{formatDate(c.valid_to)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form className="rf-panel rf-panel__body form" onSubmit={submit}>
        <h2 style={{ margin: 0 }}>Upload certificate</h2>
        <Field label="Certificate file (.p12 or .pfx)" help="Up to 100 KB." error={fileError ?? fieldErrors.certificate?.[0]}>
          <input ref={fileRef} className="rf-input" type="file" accept=".p12,.pfx" required onChange={() => { setFileError(undefined); setDone(false) }} />
        </Field>
        <Field label="Certificate password" error={fieldErrors.password?.[0]}>
          <input className="rf-input" type="password" autoComplete="off" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="PAC" error={fieldErrors.pac?.[0]}>
          <input className="rf-input rf-input--mono" type="password" autoComplete="off" required value={pac} onChange={(e) => setPac(e.target.value)} />
        </Field>
        {generic && <div className="rf-alert rf-alert--danger">{generic}</div>}
        {done && <div className="rf-alert rf-alert--success">Certificate uploaded.</div>}
        <div><button className="rf-btn rf-btn--primary" disabled={upload.isPending} aria-busy={upload.isPending}>{upload.isPending ? 'Uploading…' : 'Upload certificate'}</button></div>
      </form>
    </div>
  )
}
