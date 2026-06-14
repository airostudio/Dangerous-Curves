import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteAdminUser, updateAdminPassword } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const targetId = parseInt(id);
  if (targetId === session.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }
  await deleteAdminUser(targetId);
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { password } = await request.json();
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 12);
  await updateAdminPassword(parseInt(id), hash);
  return NextResponse.json({ success: true });
}
