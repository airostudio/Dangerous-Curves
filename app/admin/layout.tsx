import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Allow the login page through without auth
  return (
    <div className="flex min-h-screen bg-cream">
      {session && <AdminSidebar username={session.username} />}
      <div className="flex-1">{children}</div>
    </div>
  );
}
