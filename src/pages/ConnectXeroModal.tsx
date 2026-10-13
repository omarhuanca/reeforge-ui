import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useXeroLink } from '../api/hooks'
import { ErrorAlert, Modal } from '../components/ui'
import { onXeroResult } from './xeroChannel'
import { xeroResult, type XeroResult } from './xeroResult'

/**
 * Connects (or renews) the company's Xero organisation. Xero cannot be framed, so the consent opens in a
 * pop-up; when it finishes, the pop-up reports back and this modal shows the outcome over the same page.
 * The link can also be copied for the accountant, who then finishes on the result page.
 */
export function ConnectXeroModal({ companyId, onClose }: { companyId: number; onClose: () => void }) {
  const qc = useQueryClient()
  const link = useXeroLink(companyId)
  const started = useRef(false)
  const popup = useRef<Window | null>(null)
  const [result, setResult] = useState<XeroResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const url = link.data?.url

  // One link per opening (it works once); the guard keeps StrictMode from creating two.
  useEffect(() => {
    if (started.current) return
    started.current = true
    link.mutate()
  }, [link])

  useEffect(
    () =>
      onXeroResult((status) => {
        const outcome = xeroResult(status)
        setResult(outcome)
        if (outcome.ok) {
          qc.invalidateQueries({ queryKey: ['xero', companyId] })
          qc.invalidateQueries({ queryKey: ['xero-pending', companyId] })
        }
      }),
    [qc, companyId],
  )

  // A pop-up left open behind the modal would hold a consumed link.
  useEffect(() => () => popup.current?.close(), [])

  function open() {
    if (!url) return
    setResult(null)
    popup.current = window.open(url, 'reeforge-xero', 'popup,width=560,height=760')
    setBlocked(!popup.current)
  }

  function again() {
    setResult(null)
    setCopied(false)
    setBlocked(false)
    link.mutate()
  }

  return (
    <Modal
      title="Connect Xero"
      onClose={onClose}
      foot={
        result ? (
          <>
            {!result.ok && <button type="button" className="rf-btn rf-btn--secondary" onClick={again}>Try again</button>}
            <button type="button" className="rf-btn rf-btn--primary" onClick={onClose}>{result.ok ? 'Done' : 'Close'}</button>
          </>
        ) : (
          <>
            <button type="button" className="rf-btn rf-btn--secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="rf-btn rf-btn--primary" disabled={!url} aria-busy={link.isPending} onClick={open}>
              {link.isPending ? 'Creating link…' : 'Continue to Xero'}
            </button>
          </>
        )
      }
    >
      <div className="stack" style={{ gap: 12 }}>
        {result ? (
          <div className={`rf-alert rf-alert--${result.ok ? 'success' : 'danger'}`} role={result.ok ? 'status' : 'alert'}>
            <div><strong>{result.title}.</strong> {result.text}</div>
          </div>
        ) : (
          <>
            <p style={{ margin: 0 }}>
              Xero opens in a new window. Choose exactly one organisation and continue; this page updates when you are back.
            </p>
            {blocked && (
              <div className="rf-alert rf-alert--warning" role="alert">
                <div>The browser blocked the window. Allow pop-ups for this site and try again, or copy the link below.</div>
              </div>
            )}
            {link.isError && <ErrorAlert error={link.error} onRetry={again} />}
            {url && (
              <div className="stack" style={{ gap: 8 }}>
                <p className="rf-muted rf-sm" style={{ margin: 0 }}>
                  The company's accountant can connect instead: send them this one-time link (valid 24 hours).
                </p>
                <input className="rf-input rf-input--mono" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Connection link" />
                <div>
                  <button type="button" className="rf-btn rf-btn--secondary rf-btn--sm" onClick={() => navigator.clipboard.writeText(url).then(() => setCopied(true))}>
                    {copied ? 'Link copied' : 'Copy link'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
