// Lightweight fetch wrapper around the FamiMakeOver backend.
// Handles base URL, JSON, bearer token, and error normalization.

/**
 * Backend base URL including `/api`.
 * Set NEXT_PUBLIC_API_URL in Vercel (Project → Settings → Environment Variables).
 * Example: https://your-api.vercel.app/api
 */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "")

const TOKEN_KEY = "fmo_token"

export class ApiError extends Error {
  status: number
  details?: string[]
  constructor(status: number, message: string, details?: string[]) {
    super(message)
    this.status = status
    this.details = details
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

type Options = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean }

export async function api<T = any>(path: string, options: Options = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  }

  if (auth) {
    const token = getToken()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, "Cannot reach the server. Please check your connection.")
  }

  const isJson = res.headers.get("content-type")?.includes("application/json")
  const payload = isJson ? await res.json().catch(() => ({})) : {}

  if (!res.ok) {
    throw new ApiError(
      res.status,
      payload?.message || `Request failed (${res.status})`,
      payload?.details,
    )
  }
  return payload as T
}

// Convenience helpers
export const apiGet = <T = any>(path: string, auth = true) => api<T>(path, { method: "GET", auth })
export const apiPost = <T = any>(path: string, body?: unknown, auth = true) =>
  api<T>(path, { method: "POST", body, auth })
export const apiPatch = <T = any>(path: string, body?: unknown, auth = true) =>
  api<T>(path, { method: "PATCH", body, auth })
export const apiDelete = <T = any>(path: string, auth = true) =>
  api<T>(path, { method: "DELETE", auth })
