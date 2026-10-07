const TOKEN_KEY = 'reeforge.token'
// Origin only: every path below already starts with /api, so a trailing /api is dropped.
const BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/+(api\/?)?$/, '')

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: Record<string, string[]> = {},
  ) {
    super(message)
  }
}

let onUnauthorized: () => void = () => {}
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn
}

export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; form?: FormData; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, form, auth = true } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = tokenStore.get()
  if (auth && token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
  })

  if (res.status === 204) return undefined as T
  const text = await res.text()
  const json = text ? safeJson(text) : null

  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized()
    throw new ApiError(res.status, json?.message ?? `Request failed (${res.status})`, json?.errors ?? {})
  }
  return json as T
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** First validation message of a Laravel 422, or the generic message. */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const first = Object.values(e.errors)[0]?.[0]
    return first ?? e.message
  }
  return e instanceof Error ? e.message : 'Something went wrong'
}
