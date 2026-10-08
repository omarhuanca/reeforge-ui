import { useEffect, useId, useRef, type ReactNode } from 'react'
import { errorMessage } from '../api/client'

export const Badge = ({ cls, children }: { cls: string; children: ReactNode }) => (
  <span className={`rf-badge ${cls}`}>{children}</span>
)

export const ErrorAlert = ({ error, onRetry }: { error: unknown; onRetry?: () => void }) => (
  <div className="rf-alert rf-alert--danger" role="alert">
    <div>
      <strong>Something went wrong.</strong> {errorMessage(error)}
    </div>
    {onRetry && (
      <button className="rf-btn rf-btn--secondary rf-btn--sm" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
)

export const Empty = ({ title, text, action, compact }: { title: string; text: string; action?: ReactNode; compact?: boolean }) => (
  <div className={`rf-empty${compact ? ' rf-empty--compact' : ''}`}>
    <div className="rf-empty__title">{title}</div>
    <div className="rf-empty__text">{text}</div>
    {action}
  </div>
)

export const Skeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="stack" style={{ gap: 8 }}>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="rf-skeleton" style={{ height: 36 }} />
    ))}
  </div>
)

export function Modal({
  title,
  onClose,
  children,
  foot,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  foot?: ReactNode
}) {
  // Native <dialog> opened with showModal(): focus trap, Esc and ::backdrop come from the browser.
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      className="rf-modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (e.target === ref.current) onClose()
      }}
    >
      <div className="rf-modal__head">
        <h2 id={titleId} style={{ margin: 0 }}>{title}</h2>
      </div>
      <div className="rf-modal__body">{children}</div>
      {foot && <div className="rf-modal__foot">{foot}</div>}
    </dialog>
  )
}

export function Pager({
  page,
  last,
  total,
  onPage,
}: {
  page: number
  last: number
  total: number
  onPage: (p: number) => void
}) {
  return (
    <div className="rf-table-foot">
      <span>{total} total</span>
      <span className="row">
        <button className="rf-btn rf-btn--secondary rf-btn--sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        <span className="rf-sm">
          {page} / {Math.max(last, 1)}
        </span>
        <button className="rf-btn rf-btn--secondary rf-btn--sm" disabled={page >= last} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </span>
    </div>
  )
}

export const Field = ({
  label,
  error,
  help,
  children,
}: {
  label: string
  error?: string
  help?: string
  children: ReactNode
}) => (
  <label className="rf-field">
    <span className="rf-label">{label}</span>
    {children}
    {error ? <span className="rf-error-text">{error}</span> : help ? <span className="rf-help">{help}</span> : null}
  </label>
)
