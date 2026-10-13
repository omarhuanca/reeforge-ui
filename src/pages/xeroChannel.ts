/**
 * The Xero consent runs in a pop-up. window.opener does not survive Xero's pages, so the result page
 * reports back over a same-origin BroadcastChannel instead; the connect modal listens and refreshes.
 */
const NAME = 'reeforge-xero-connect'

export function announceXeroResult(status: string | null) {
  if (typeof BroadcastChannel === 'undefined') return
  const channel = new BroadcastChannel(NAME)
  channel.postMessage({ status })
  channel.close()
}

export function onXeroResult(callback: (status: string | null) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => {}
  const channel = new BroadcastChannel(NAME)
  channel.onmessage = (e: MessageEvent<{ status?: unknown }>) => {
    callback(typeof e.data?.status === 'string' ? e.data.status : null)
  }
  return () => channel.close()
}
