export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new ApiError(response.status, error.message || 'Request failed')
  }

  const data = await response.json()
  return data.data ?? data
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  }),
  put: <T>(path: string, body?: unknown) => request<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  auth: {
    login: (email: string, password: string) =>
      request<{ user: { id: string; email: string; name: string } }>('/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, name: string) =>
      request<{ user: { id: string; email: string; name: string } }>('/auth/sign-up/email', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),
    logout: () => request('/auth/sign-out', { method: 'POST' }),
    me: () => request<{ id: string; email: string; name: string }>('/auth/me'),
  },
}
