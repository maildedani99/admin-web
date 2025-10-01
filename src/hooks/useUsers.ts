"use client";
import useSWR from "swr";
import { apiFetcher, type SWRKey } from "@/lib/swr";
import { getToken } from "@/lib/auth";

export type Role = "admin" | "teacher" | "client";
export type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string | null;
};

export default function useUsers(
  tokenLike: string | null,
  { type, search = "", page = 1, per_page = 50 }: { type: "clients" | "members"; search?: string; page?: number; per_page?: number }
) {
  const token = tokenLike ?? getToken();
  const path = type === "clients" ? "users/clients" : "users/members";

  const key: SWRKey | null = token ? ["GET", path, { search, page, per_page }, token] : null;

  const { data, error, isLoading, mutate } = useSWR<UserRow[]>(key, apiFetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  return { rows: data ?? [], error, isLoading, mutate };
}
