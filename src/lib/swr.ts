export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type SWRKey = [method: HttpMethod, path: string, params?: any, tokenRaw?: string | null];

const API = (process.env.NEXT_PUBLIC_API_ROUTE || "").replace(/\/+$/, ""); // ej: http://localhost:8000/api

function toQuery(params: Record<string, any> | null | undefined) {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function buildUrl(path: string, method: HttpMethod, params?: any) {
  const isAbs = /^https?:\/\//i.test(path);
  const base = isAbs ? "" : API ? `${API}/` : "";
  const clean = path.replace(/^\/+/, "");
  if (method === "GET" && params && !(params instanceof FormData)) {
    return `${base}${clean}${toQuery(params)}`;
  }
  return `${base}${clean}`;
}

function asBearerHeader(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = String(raw).replace(/^["']|["']$/g, "").trim();
  return /^bearer\s+/i.test(t) ? t : `Bearer ${t}`;
}

export async function apiFetcher<T = any>(key: SWRKey): Promise<T> {
  const [method, path, params, tokenRaw] = key;
  const url = buildUrl(path, method, params);

  const headers: Record<string, string> = { Accept: "application/json" };
  let body: BodyInit | undefined;

  if (method !== "GET") {
    if (params instanceof FormData) {
      body = params; // no seteamos Content-Type
    } else if (params !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(params);
    }
  }

  const authHeader = asBearerHeader(tokenRaw);
  if (authHeader) headers.Authorization = authHeader;

  const res = await fetch(url, { method, headers, body, cache: "no-store", mode: "cors", redirect: "follow" });
  const json: any = await res.json().catch(() => ({}));

  if (!res.ok || json?.success === false) {
    const err: any = new Error(json?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.errors = json?.errors;
    throw err;
  }
  return (json?.data ?? json) as T;
}
