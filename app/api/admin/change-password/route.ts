import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { findAdminByUsername, updateAdminPassword } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Both fields are required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  const user = await findAdminByUsername(session.username);
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const hash = bcrypt.hashSync(newPassword, 12);
  await updateAdminPassword(user.id, hash);

  return NextResponse.json({ success: true });
}
