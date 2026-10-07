import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'reeforge.theme'
const listeners = new Set<() => void>()

/** Saved choice, else the OS setting. Storage may be blocked, so every access is guarded. */
export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function apply(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* ignore */
  }
  apply(theme)
  listeners.forEach((l) => l())
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme)
  const toggle = useCallback(() => setTheme(readTheme() === 'dark' ? 'light' : 'dark'), [])
  return { theme, toggle }
}
