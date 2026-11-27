// The page an emailed link opens to set a password: an invitation (new account,
// link valid 72 h) or a forgotten password (link valid 60 min). Both come from
// nexo-bk as {FRONTEND_URL}/<page>?token=…&email=…

export type SetPasswordMode = 'invitation' | 'reset'

export const MIN_PASSWORD = 8

export const setPasswordCopy: Record<SetPasswordMode, { title: string; intro: string; button: string; endpoint: string }> = {
  invitation: {
    title: 'Accept your invitation',
    intro: 'Choose a password for your Reeforge Finance account. You will be signed in right after.',
    button: 'Set password and sign in',
    endpoint: '/auth/invitation/accept',
  },
  reset: {
    title: 'Set a new password',
    intro: 'Choose a new password. Your open sessions will be closed and you will be signed in again.',
    button: 'Set password and sign in',
    endpoint: '/auth/password/reset',
  },
}

/** The token and email of the link, or null if the link is incomplete. */
export function readLink(params: URLSearchParams): { token: string; email: string } | null {
  const token = params.get('token')?.trim() ?? ''
  const email = params.get('email')?.trim() ?? ''
  return token && email ? { token, email } : null
}

/** The first problem with the chosen password, checked before calling the API. */
export function passwordProblem(password: string, confirmation: string): string | null {
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`
  if (password !== confirmation) return 'The two passwords do not match.'
  return null
}
