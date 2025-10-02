// app/admin/courses/page.tsx
import CoursesTable from "@/app/components/CoursesTable";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("admin");
  return <div style={{ padding: 24 }}><CoursesTable /></div>;
}
