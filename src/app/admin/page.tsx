import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const token = cookies().get("rb.token")?.value;
  if (!token) redirect("/login");
  return <main style={{ padding: 24 }}>Dashboard Admin</main>;
}
