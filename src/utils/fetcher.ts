// Firma compatible: fetcher(url, method="GET", body=null, auth=null)
// También compatible con SWR key array: fetcher([url, method, body, auth])

const API_BASE = (process.env.NEXT_PUBLIC_API_ROUTE || "").replace(/\/+$/, "");

type AuthArg =
  | null
  | string
  | { token?: string; user?: { tenant_id?: string | number } | null };

function asBearerHeader(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const t = String(raw).replace(/^["']|["']$/g, "").trim();
  if (/^bearer\s+/i.test(t)) return t; // ya viene con Bearer
  return `Bearer ${t}`;
}

function toQuery(params: Record<string, any> | null | undefined): string {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function buildUrl(pathOrUrl: string, method: string, body: any) {
  const isAbs = /^https?:\/\//i.test(pathOrUrl);
  const base = isAbs ? "" : API_BASE ? `${API_BASE}/` : "";
  const path = pathOrUrl.replace(/^\/+/, "");
  // GET: si body es objeto normal → querystring
  if (method.toUpperCase() === "GET" && body && !(body instanceof FormData)) {
    return `${base}${path}${toQuery(body)}`;
  }
  return `${base}${path}`;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    null
  );
}

function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("token", token);
    localStorage.setItem("token", token);
  } catch {}
}

function clearStoredToken() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
  } catch {}
}

export async function fetchApiData(
  urlOrKey: any,
  method: string = "GET",
  body: any = null,
  auth: AuthArg = null
): Promise<any> {
  // Soporta SWR: [url, method, body, auth]
  if (Array.isArray(urlOrKey)) {
    [urlOrKey, method, body, auth] = urlOrKey;
  }

  // auth puede ser string (token) o { token, user }
  if (!auth && typeof window !== "undefined") {
    const stored = getStoredToken();
    if (stored) auth = stored;
  }

  const getTokenFromAuth = (a: AuthArg) =>
    typeof a === "string"
      ? a
      : a && "token" in (a as any)
      ? (a as any).token
      : null;

  const doRequest = async (authArg: AuthArg): Promise<any> => {
    const token = getTokenFromAuth(authArg);

    const tenantId =
      authArg && typeof authArg === "object" && (authArg as any).user?.tenant_id
        ? String((authArg as any).user.tenant_id)
        : "";

    const url = buildUrl(String(urlOrKey), method, body);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Cache-Control": "no-store",
    };

    let payload: BodyInit | undefined = undefined;

    if (method.toUpperCase() !== "GET") {
      if (body instanceof FormData) {
        payload = body; // no pongas Content-Type, el navegador añade el boundary
      } else if (body != null) {
        headers["Content-Type"] = "application/json";
        payload = JSON.stringify(body);
      }
    }

    const authHeader = asBearerHeader(token);
    if (authHeader) headers.Authorization = authHeader;
    if (tenantId) headers["X-Tenant-ID"] = tenantId;

    const res = await fetch(url, {
      method,
      headers,
      body: payload,
      mode: "cors",
      redirect: "follow",
      cache: "no-store",
      keepalive: false,
    });

    // 204 No Content
    if (res.status === 204) return null;

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // puede no haber cuerpo JSON
    }

    // Tu API: { success, message, data, errors, meta }
    if (!res.ok || (json && json.success === false)) {
      const msg = json?.message || res.statusText || `HTTP ${res.status}`;
      const err: any = new Error(msg);
      err.status = res.status;
      err.errors = json?.errors;
      err.raw = json;
      throw err;
    }

    return json?.data ?? json; // devuelve data si existe; si no, el json tal cual
  };

  // Intenta refresh si 401 y reintenta UNA vez
  const tryRefresh = async (oldAuth: AuthArg): Promise<AuthArg | null> => {
    try {
      const token = getTokenFromAuth(oldAuth) || getStoredToken();
      const refreshUrl = buildUrl("auth/refresh", "POST", null);
      const resp = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: asBearerHeader(token) || "",
        },
        mode: "cors",
        cache: "no-store",
      });
      const j = await resp.json().catch(() => null);
      if (!resp.ok || !j?.token) throw new Error(j?.message || "No refresh");

      // guarda token nuevo
      setStoredToken(j.token);

      // devuelve nuevo auth con el token actualizado
      if (typeof oldAuth === "string" || oldAuth === null) {
        return j.token as string;
      }
      return { ...(oldAuth as any), token: j.token };
    } catch {
      return null;
    }
  };

  try {
    return await doRequest(auth);
  } catch (e: any) {
    if (e?.status === 401) {
      // Intentamos refrescar y reintentar
      const refreshedAuth = await tryRefresh(auth);
      if (refreshedAuth) {
        try {
          return await doRequest(refreshedAuth);
        } catch (e2: any) {
          if (e2?.status === 401) {
            clearStoredToken();
          }
          throw e2;
        }
      }
      // No se pudo refrescar
      clearStoredToken();
    }
    throw e;
  }
}

export const fetcher = fetchApiData;
export default fetchApiData;
