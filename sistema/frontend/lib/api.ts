type ApiOptions = RequestInit & { skipAuthRedirect?: boolean };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuthRedirect, ...fetchOptions } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers ?? {}),
  };

  const res = await fetch(`/api${path}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (res.status === 401) {
    if (!skipAuthRedirect && typeof window !== 'undefined' && !path.startsWith('/auth/login')) {
      window.location.href = '/login';
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Sessão expirada');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Erro na requisição');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
