import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../authContext'
import { api, ApiError, errorMessage } from '../api/client'
import { Brand } from '../components/BrandMark'
import { Field } from '../components/ui'
import { ThemeToggle } from '../components/ThemeToggle'
import { LangSwitch } from '../components/LangSwitch'
import { MIN_PASSWORD, passwordProblem, readLink, setPasswordCopy, type SetPasswordMode } from './setPassword'

/**
 * Where an invitation (or forgotten-password) email lands. Public: the person
 * has no session yet. After setting the password it signs them in and opens the app.
 */
export function SetPasswordPage({ mode }: { mode: SetPasswordMode }) {
  const [params] = useSearchParams()
  const link = readLink(params)
  const copy = setPasswordCopy[mode]
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [linkError, setLinkError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!link) return
    const problem = passwordProblem(password, confirmation)
    if (problem) return setError(problem)

    setBusy(true)
    setError('')
    try {
      await api(copy.endpoint, {
        method: 'POST',
        auth: false,
        body: { token: link.token, email: link.email, password, password_confirmation: confirmation },
      })
    } catch (err) {
      // An invalid or expired link cannot be fixed on this page: ask for a new one.
      if (err instanceof ApiError && err.errors.token) setLinkError(err.errors.token[0])
      else setError(errorMessage(err))
      setBusy(false)
      return
    }

    try {
      await signIn(link.email, password)
      navigate('/', { replace: true })
    } catch {
      // The password is set; only the automatic sign-in failed.
      navigate('/login', { replace: true })
    }
  }

  const broken = !link || linkError

  return (
    <div className="login">
      <div className="row" style={{ position: 'fixed', top: 16, right: 16 }}><LangSwitch /><ThemeToggle /></div>
      <form className="login__card rf-panel rf-panel__body form" onSubmit={submit}>
        <Brand className="login__brand" />
        <h1 style={{ margin: 0 }}>{copy.title}</h1>
        {broken ? (
          <>
            <div className="rf-alert rf-alert--danger" role="alert">
              <div>
                {linkError ? 'This link is invalid, already used or has expired.' : 'This link is incomplete.'}{' '}
                {mode === 'invitation' ? 'Ask whoever invited you to send the invitation again.' : 'Ask for a new link from the sign-in page.'}
              </div>
            </div>
            <Link to="/login" className="rf-btn rf-btn--lg">Go to sign in</Link>
          </>
        ) : (
          <>
            <p style={{ margin: 0 }}>{copy.intro}</p>
            <Field label="Email">
              <input className="rf-input" type="email" autoComplete="username" value={link.email} readOnly />
            </Field>
            <Field label="New password" error={error}>
              <input className="rf-input" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD} value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} autoFocus />
            </Field>
            <Field label="Repeat the password">
              <input className="rf-input" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
            </Field>
            <button className="rf-btn rf-btn--primary rf-btn--lg" disabled={busy} aria-busy={busy}>
              {busy ? 'Setting password…' : copy.button}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
