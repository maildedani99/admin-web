// app/admin/settings/page.tsx
import SettingsForm from "@/app/components/SettingsForm";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic"; // evita caching de Next

export default async function AdminSettingsPage() {
  // ✅ solo permite admins
  await requireRole("admin");

  return (
    <div style={{ padding: 24 }}>
      <SettingsForm />
    </div>
  );
}
