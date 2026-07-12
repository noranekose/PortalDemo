const API_BASE = import.meta.env.VITE_COMMON_API_URL

export interface AuthSession {
  access_token: string
  refresh_token: string
}

export interface AuthUser {
  id: string
  email: string | null
}

interface AuthResponse {
  user: AuthUser
  session: AuthSession | null
}

interface ErrorResponse {
  error: string
}

async function post<T extends object>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json()) as T | ErrorResponse
  if (!res.ok) {
    throw new Error('error' in data ? data.error : '認証に失敗しました')
  }
  return data as T
}

export function signUp(email: string, password: string): Promise<AuthResponse> {
  return post('/auth/signup', { email, password })
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return post('/auth/login', { email, password })
}

export function logout(session: AuthSession): Promise<{ ok: true }> {
  return post('/auth/logout', session)
}
