const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('gigsevak_token') || sessionStorage.getItem('gigsevak_token') || null;
  } catch {
    return null;
  }
};

export const ensureAdminToken = async (): Promise<string | null> => {
  let token = getAuthToken();
  if (token) return token;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'admin@gigsevak.coop', password: 'admin123' })
    });
    const data = await res.json();
    const freshToken = data?.data?.accessToken || data?.accessToken;
    if (freshToken) {
      localStorage.setItem('gigsevak_token', freshToken);
      sessionStorage.setItem('gigsevak_token', freshToken);
      return freshToken;
    }
  } catch (err: any) {
    console.warn('[Admin API] ensureAdminToken failed:', err.message);
  }
  return null;
};

export const request = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  let token = getAuthToken();
  if (!token && !endpoint.includes('/auth/admin/login')) {
    token = await ensureAdminToken();
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (response.status === 401 && !(options as any)._retry && !endpoint.includes('/auth/admin/login')) {
      const freshToken = await ensureAdminToken();
      if (freshToken) {
        headers['Authorization'] = `Bearer ${freshToken}`;
        return await request<T>(endpoint, { ...options, headers, _retry: true } as any);
      }
    }

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.message || `HTTP ${response.status}: Request failed`;
      const err = new Error(errorMsg) as any;
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err: any) {
    console.warn(`[Admin API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
    throw err;
  }
};

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body }),
  delete: <T = any>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' })
};

export default api;