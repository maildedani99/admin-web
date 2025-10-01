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
  if (/^bearer\s+/i.test(t)) return t;          // ya viene con Bearer
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

if (!auth && typeof window !== "undefined") {
  const stored =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    null;
  if (stored) auth = stored;
}  // auth puede ser string (token) o { token, user }
  const token =
    typeof auth === "string" ? auth :
    (auth && "token" in (auth as any) ? (auth as any).token : null);

  const tenantId =
    auth && typeof auth === "object" && (auth as any).user?.tenant_id
      ? String((auth as any).user.tenant_id)
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
  });

  let json: any = null;
  try { json = await res.json(); } catch { /* sin cuerpo */ }

  // Tu API: { success, message, data, errors, meta }
  if (!res.ok || (json && json.success === false)) {
    const msg = json?.message || res.statusText || `HTTP ${res.status}`;
    const err: any = new Error(msg);
    err.status = res.status;
    err.errors = json?.errors;
    throw err;
  }

  return json?.data ?? json; // devuelve data si existe; si no, el json tal cual
}

export const fetcher = fetchApiData;
export default fetchApiData;
