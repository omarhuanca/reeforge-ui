import { useSyncExternalStore } from 'react'

// English and Bislama. The choice is stored and sets <html lang>, but no Bislama
// strings exist yet: every label is still English until translations are provided.
export type Lang = 'en' | 'bi'
const KEY = 'reeforge.lang'
const listeners = new Set<() => void>()

export function readLang(): Lang {
  try {
    return localStorage.getItem(KEY) === 'bi' ? 'bi' : 'en'
  } catch {
    return 'en'
  }
}

export function setLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lang
  listeners.forEach((l) => l())
}

export const initLang = () => {
  document.documentElement.lang = readLang()
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const useLang = () => useSyncExternalStore(subscribe, readLang)
