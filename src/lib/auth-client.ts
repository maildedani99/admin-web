// src/lib/auth-client.ts
export function getClientToken(): string | null {
  // Evita acceso en SSR
  const hasDOM = typeof window !== 'undefined' && typeof document !== 'undefined';
  if (!hasDOM) return null;

  try {
    // 1) cookie
    const m = document.cookie?.match(/(?:^|;\s*)rb\.token=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);

    // 2) storages
    const raw =
      window.sessionStorage?.getItem('token') ||
      window.localStorage?.getItem('token') ||
      null;

    if (raw) return String(raw).replace(/^["']|["']$/g, '').trim() || null;
  } catch {
    // no-op
  }
  return null;
}
