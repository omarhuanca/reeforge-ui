import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { logout as apiLogout, login as apiLogin } from './api/hooks'
import { Ctx, type AuthState } from './authContext'
import { setUnauthorizedHandler, tokenStore } from './api/client'

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const [authed, setAuthed] = useState(() => !!tokenStore.get())

  const clear = useCallback(() => {
    tokenStore.clear()
    qc.clear()
    setAuthed(false)
  }, [qc])

  // An expired or revoked token (401) sends the admin back to the login.
  useEffect(() => setUnauthorizedHandler(clear), [clear])

  const value = useMemo<AuthState>(
    () => ({
      authed,
      signIn: async (email, password) => {
        const res = await apiLogin(email, password)
        tokenStore.set(res.data.token)
        setAuthed(true)
      },
      signOut: async () => {
        try {
          await apiLogout()
        } catch {
          /* the token may already be gone: clear locally anyway */
        }
        clear()
      },
    }),
    [authed, clear],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
