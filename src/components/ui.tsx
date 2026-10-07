import type { ReactNode } from 'react'
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

export const Empty = ({ title, text, action }: { title: string; text: string; action?: ReactNode }) => (
  <div className="rf-empty">
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
  return (
    <div className="rf-overlay" onClick={onClose}>
      <div className="rf-modal rf-glass--strong" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="rf-modal__head">
          <h2 style={{ margin: 0 }}>{title}</h2>
        </div>
        <div className="rf-modal__body">{children}</div>
        {foot && <div className="rf-modal__foot">{foot}</div>}
      </div>
    </div>
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
