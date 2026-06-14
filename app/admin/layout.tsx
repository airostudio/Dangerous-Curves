import { getSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    return (
      <>
        <Toaster position="top-center" richColors />
        {children}
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <AdminShell username={session.username}>{children}</AdminShell>
    </>
  );
}
