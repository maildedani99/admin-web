// lib/auth-client.ts
"use client";

/** Lee el token desde document.cookie o storage en cliente */
export function getClientToken(): string | null {
  // 1) cookie
  const match = document.cookie.match(/(?:^|;\s*)rb\.token=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);

  // 2) storage (por si también lo guardaste ahí)
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

/** Lee el rol del user en cliente */
export function getClientRole(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)rb\.role=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  return null;
}
