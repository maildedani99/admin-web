import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  const session = await requireRole("admin");
  return <main>Dashboard — {session.email}</main>;
}
