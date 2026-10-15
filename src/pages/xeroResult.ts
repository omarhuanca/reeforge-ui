export type XeroResult = { ok: boolean; title: string; text: string }

const RESULTS: Record<string, XeroResult> = {
  connected: { ok: true, title: 'Xero connected', text: 'The organisation is linked to the company.' },
  expired: { ok: false, title: 'This link expired', text: 'The connection link expired or was already used. Ask the admin for a new one.' },
  denied: { ok: false, title: 'Xero was not authorized', text: 'Open the link again to retry.' },
  unavailable: { ok: false, title: 'Xero could not finish', text: 'Try the link again in a few minutes.' },
  organisations: { ok: false, title: 'Select one organisation', text: 'Authorize exactly one Xero organisation for this company. Open the link again and select only one.' },
  channel: { ok: false, title: 'This company does not use Xero', text: 'It fiscalizes through the TaxCore API. Ask the admin to switch its channel to Xero, then use a new link.' },
  taken: { ok: false, title: 'Organisation already in use', text: 'That Xero organisation is already connected to another company.' },
}

/** The API sends only a status code in the URL; unknown or missing codes read as a generic failure. */
export function xeroResult(status: string | null): XeroResult {
  return (status && Object.hasOwn(RESULTS, status) && RESULTS[status]) || { ok: false, title: 'Connection not completed', text: 'Ask the admin for a new link.' }
}
