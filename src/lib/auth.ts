"use server";

import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "admin" | "teacher" | "client";

export type Session = {
  sub: string;
  email: string;
  role: Role;
  exp: number; // epoch seconds
  name?: string;
};

/** Obtiene sesión básica desde cookies */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();

  const token = store.get("rb.token")?.value;
  if (!token) return null;

  const exp = Number(store.get("rb.exp")?.value ?? 0);
  const now = Math.floor(Date.now() / 1000);
  if (exp && exp <= now) return null;

  return {
    sub: store.get("rb.sub")?.value ?? "",
    email: store.get("rb.email")?.value ?? "",
    role: (store.get("rb.role")?.value as Role) ?? "client",
    name: store.get("rb.name")?.value ?? "",
    exp: exp || now + 300,
  };
}

/** Obliga a estar autenticado */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    const target = await currentPath();
    redirect(`/login?redirect=${encodeURIComponent(target)}`);
  }
  return session;
}

/** Obliga a tener uno de los roles permitidos */
export async function requireRole(roles: Role | Role[]): Promise<Session> {
  const session = await requireAuth();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(session.role)) {
    redirect("/403");
  }
  return session;
}

/** Server Action: cerrar sesión */
export async function logout() {
  const store = await cookies();
  ["rb.token", "rb.exp", "rb.role", "rb.email", "rb.name", "rb.sub"].forEach((c) =>
    store.set(c, "", { path: "/", maxAge: 0 })
  );
  redirect("/login");
}

/** Devuelve el path actual para redirigir tras login */
async function currentPath(): Promise<string> {
  const h = await headers();
  const referer = h.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      return url.pathname + url.search;
    } catch {}
  }
  return "/";
}
