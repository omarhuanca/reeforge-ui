import { useCallback, useSyncExternalStore } from 'react'

// 'system' leaves <html data-theme> unset so the tokens follow prefers-color-scheme.
export type ThemePref = 'light' | 'dark' | 'system'
const KEY = 'reeforge.theme'
const listeners = new Set<() => void>()

/** Saved choice, defaulting to the OS. Storage may be blocked, so every access is guarded. */
export function readPref(): ThemePref {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  } catch {
    /* ignore */
  }
  return 'system'
}

function apply(pref: ThemePref) {
  const root = document.documentElement
  if (pref === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', pref)
}

export function setPref(pref: ThemePref) {
  try {
    localStorage.setItem(KEY, pref)
  } catch {
    /* ignore */
  }
  apply(pref)
  listeners.forEach((l) => l())
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const systemTheme = (): 'light' | 'dark' =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export const useThemePref = () => useSyncExternalStore(subscribe, readPref)

/** The theme actually shown, plus a toggle that picks the opposite one explicitly. */
export function useTheme() {
  const pref = useThemePref()
  const theme = pref === 'system' ? systemTheme() : pref
  const toggle = useCallback(() => setPref(theme === 'dark' ? 'light' : 'dark'), [theme])
  return { theme, toggle }
}
