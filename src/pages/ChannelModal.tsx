import { useState } from 'react'
import { useChangeChannel } from '../api/hooks'
import { CHANNELS, type Channel, type Company } from '../api/types'
import { ErrorAlert, Modal } from '../components/ui'
import { switchRefusal } from './channels'

/**
 * Switches how a company fiscalizes. The API refuses (409) while invoices of the channel being left may still be
 * signed, or while Xero is still connected; its message says what to do, and it changes nothing when it refuses.
 */
export function ChannelModal({ company, onClose, onChanged }: { company: Company; onClose: () => void; onChanged: (message: string) => void }) {
  const change = useChangeChannel(company.id)
  const [channel, setChannel] = useState<Channel>(company.channel)
  const refusal = switchRefusal(change.error)
  const unchanged = channel === company.channel

  return (
    <Modal
      title="Change fiscalization channel"
      onClose={onClose}
      foot={
        <>
          <button type="button" className="rf-btn rf-btn--secondary" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="rf-btn rf-btn--primary"
            disabled={unchanged || change.isPending}
            aria-busy={change.isPending}
            onClick={() =>
              change.mutate(channel, {
                onSuccess: () => {
                  onChanged(`Channel changed to ${CHANNELS.find((c) => c.value === channel)?.label}`)
                  onClose()
                },
              })
            }
          >
            {change.isPending ? 'Changing…' : 'Change channel'}
          </button>
        </>
      }
    >
      <div className="stack" style={{ gap: 12 }}>
        <fieldset className="rf-field" style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <legend className="rf-label" style={{ padding: 0 }}>Channel</legend>
          <div className="stack" style={{ gap: 10 }}>
            {CHANNELS.map((c) => (
              <label key={c.value} className="rf-check">
                <input type="radio" name="channel" value={c.value} checked={channel === c.value} onChange={() => setChannel(c.value)} />
                <span>
                  {c.label}{c.value === company.channel && ' (current)'}
                  <span className="rf-help" style={{ display: 'block' }}>{c.help}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="rf-muted rf-sm" style={{ margin: 0 }}>
          Invoices already fiscalized stay as they are. To move from Xero to TaxCore, disconnect Xero first. Invoices still pending or failed with a retryable error must be resent through the channel being left before it can change.
        </p>
        {refusal ? (
          <div className="rf-alert rf-alert--warning" role="alert">
            <div>
              {refusal.message}
              {refusal.externalIds.length > 0 && (
                <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                  {refusal.externalIds.map((id) => <li key={id} className="rf-input--mono">{id}</li>)}
                </ul>
              )}
            </div>
          </div>
        ) : (
          change.isError && <ErrorAlert error={change.error} />
        )}
      </div>
    </Modal>
  )
}
