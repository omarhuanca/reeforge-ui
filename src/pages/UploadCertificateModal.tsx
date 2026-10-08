import { useState, type FormEvent } from 'react'
import { useUploadCertificate } from '../api/hooks'
import { ApiError } from '../api/client'
import { IconEye, IconEyeOff, IconUpload } from '../components/icons'
import { Modal } from '../components/ui'
import { formatBytes } from '../format'
import { validateCertificateFile } from './certificateFile'

/** Masked input with a show/hide button (rf-input-group). */
function SecretInput({
  id,
  label,
  what,
  value,
  onChange,
  autoComplete,
  mono,
  error,
  help,
}: {
  id: string
  label: string
  what: string
  value: string
  onChange: (v: string) => void
  autoComplete: string
  mono?: boolean
  error?: string
  help?: string
}) {
  const [shown, setShown] = useState(false)
  return (
    <div className="rf-field">
      <label className="rf-label" htmlFor={id}>{label}</label>
      <div className="rf-input-group">
        <input
          id={id}
          className={`rf-input${mono ? ' rf-input--mono' : ''}`}
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          spellCheck={false}
          required
          value={value}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="rf-input-group__btn"
          aria-label={`${shown ? 'Hide' : 'Show'} ${what}`}
          aria-pressed={shown}
          onClick={() => setShown((v) => !v)}
        >
          {shown ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {error ? <span className="rf-error-text">{error}</span> : help ? <span className="rf-help">{help}</span> : null}
    </div>
  )
}

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
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [pac, setPac] = useState('')
  const [fileError, setFileError] = useState<string>()

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setFileError('Choose a .p12 or .pfx file.')
      return
    }
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
  const fileProblem = fileError ?? fieldErrors.certificate?.[0]

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
        <div className="rf-field">
          <span className="rf-label" id="cert-file-label">Certificate file (.p12 or .pfx)</span>
          <label className="rf-file" data-state={file ? 'selected' : undefined} aria-invalid={!!fileProblem}>
            <input
              type="file"
              accept=".p12,.pfx"
              aria-labelledby="cert-file-label"
              autoFocus
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null)
                setFileError(undefined)
              }}
            />
            <span className="rf-file__icon"><IconUpload /></span>
            <span className="rf-file__text">
              <span className="rf-file__name">{file ? file.name : 'Choose a .p12 or .pfx file'}</span>
              <span className="rf-file__meta">{file ? formatBytes(file.size) : 'or drop it here · up to 100 KB'}</span>
            </span>
          </label>
          {fileProblem && <span className="rf-error-text">{fileProblem}</span>}
        </div>
        <SecretInput
          id="cert-password"
          label="Certificate password"
          what="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          error={fieldErrors.password?.[0]}
        />
        <SecretInput
          id="cert-pac"
          label="PAC"
          what="PAC"
          value={pac}
          onChange={setPac}
          autoComplete="off"
          mono
          error={fieldErrors.pac?.[0]}
          help="The PAC code TaxCore sent with the certificate. It is needed to sign invoices."
        />
        {generic && <div className="rf-alert rf-alert--danger">{generic}</div>}
      </form>
    </Modal>
  )
}
