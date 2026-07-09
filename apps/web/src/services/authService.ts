const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

interface AuthResponse {
  user: { id: string; email: string; name: string }
  token: string
}

interface ApiError {
  error: string
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error((data as ApiError).error || 'Request failed')
  return data as T
}

export const authService = {
  login(email: string, password: string) {
    return request<AuthResponse>('/api/auth/login', { email, password })
  },

  register(email: string, name: string, password: string) {
    return request<AuthResponse>('/api/auth/register', { email, name, password })
  },

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const stored = localStorage.getItem('musicflow-auth')
    const token = stored ? JSON.parse(stored)?.state?.token : null
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  },
}
