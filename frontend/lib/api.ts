const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const TOKEN_STORAGE_KEY = 'qsealnet.token';
export const UNAUTHORIZED_EVENT = 'qsealnet:unauthorized';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function authHeaders(base: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return token ? { ...base, Authorization: `Bearer ${token}` } : base;
}

function notifyUnauthorized(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = (isJson ? await response.json() : await response.text()) as T | string;

  if (!response.ok) {
    if (response.status === 401) {
      notifyUnauthorized();
    }
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload
        ? String((payload as { error?: string }).error || response.statusText)
        : response.statusText;
    throw new Error(message || 'Request failed');
  }

  return payload as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    headers: authHeaders(),
  });
  return parseResponse<T>(response);
}

export async function apiJson<T>(
  path: string,
  options: { method?: string; headers?: Record<string, string>; body?: unknown } = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'POST',
    headers: authHeaders({
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return parseResponse<T>(response);
}

export async function apiForm<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  return parseResponse<T>(response);
}

export async function apiBinary(path: string, formData: FormData): Promise<Blob> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      notifyUnauthorized();
    }
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || response.statusText || 'Request failed');
  }

  return response.blob();
}

export { API_BASE };
