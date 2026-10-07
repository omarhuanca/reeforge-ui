import { useState, type FormEvent } from 'react'
import { useAuth } from '../authContext'
import { errorMessage } from '../api/client'
import { Field } from '../components/ui'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <form className="login__card rf-panel rf-panel__body form" onSubmit={submit}>
        <h1 style={{ margin: 0 }}>Sign in to Reeforge Finance</h1>
        <Field label="Email" error={error}>
          <input className="rf-input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
        </Field>
        <Field label="Password">
          <input className="rf-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <button className="rf-btn rf-btn--primary rf-btn--lg" disabled={busy} aria-busy={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
