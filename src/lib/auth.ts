// Prioridad: cookie → sessionStorage → localStorage
export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const m = document.cookie.match(/(?:^|;\s*)rb\.token=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);

  const s = sessionStorage.getItem("token");
  if (s) return s;

  const l = localStorage.getItem("token");
  return l || null;
}

export function asBearerHeader(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = String(raw).replace(/^["']|["']$/g, "").trim();
  return /^bearer\s+/i.test(t) ? t : `Bearer ${t}`;
}

// Opcional: para login/logout
export function setToken(token: string, remember = false) {
  if (remember) {
    sessionStorage.removeItem("token");
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
    sessionStorage.setItem("token", token);
  }
  document.cookie = `rb.token=${encodeURIComponent(token)}; Path=/; SameSite=Lax${
    remember ? "; Max-Age=2592000" : ""
  }${typeof window !== "undefined" && location.protocol === "https:" ? "; Secure" : ""}`;
}

export function clearToken() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  document.cookie = "rb.token=; Path=/; Max-Age=0";
}
