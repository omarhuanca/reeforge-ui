import { useRef, useState, type FormEvent } from 'react'
import { useUploadCertificate } from '../api/hooks'
import { ApiError } from '../api/client'
import { Field, Modal } from '../components/ui'
import { validateCertificateFile } from './certificateFile'

export function UploadCertificateModal({
  companyId,
  onClose,
  onUploaded,
}: {
  companyId: number
  onClose: () => void
  onUploaded: () => void
}) {
  const upload = useUploadCertificate(companyId)
  const fileRef = useRef<HTMLInputElement>(null)
  const [password, setPassword] = useState('')
  const [pac, setPac] = useState('')
  const [fileError, setFileError] = useState<string>()

  function submit(e: FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
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
        onUploaded()
        onClose()
      },
    })
  }

  const fieldErrors = upload.error instanceof ApiError ? upload.error.errors : {}
  const generic = upload.error && !Object.keys(fieldErrors).length ? (upload.error as Error).message : undefined

  return (
    <Modal
      title="Upload certificate"
      onClose={onClose}
      foot={
        <>
          <button type="button" className="rf-btn rf-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="rf-btn rf-btn--primary" form="upload-cert-form" disabled={upload.isPending} aria-busy={upload.isPending}>
            {upload.isPending ? 'Uploading…' : 'Upload certificate'}
          </button>
        </>
      }
    >
      <form id="upload-cert-form" className="form" onSubmit={submit}>
        <Field label="Certificate file (.p12 or .pfx)" help="Up to 100 KB." error={fileError ?? fieldErrors.certificate?.[0]}>
          <input ref={fileRef} className="rf-input" type="file" accept=".p12,.pfx" required autoFocus onChange={() => setFileError(undefined)} />
        </Field>
        <Field label="Certificate password" error={fieldErrors.password?.[0]}>
          <input className="rf-input" type="password" autoComplete="off" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="PAC" error={fieldErrors.pac?.[0]}>
          <input className="rf-input rf-input--mono" type="password" autoComplete="off" required value={pac} onChange={(e) => setPac(e.target.value)} />
        </Field>
        {generic && <div className="rf-alert rf-alert--danger">{generic}</div>}
      </form>
    </Modal>
  )
}
