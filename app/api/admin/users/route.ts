import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllAdminUsers, createAdminUser } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await getAllAdminUsers();
  return NextResponse.json({ users, current_user_id: session.id });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const id = await createAdminUser(username.trim().toLowerCase(), passwordHash);
  return NextResponse.json({ id }, { status: 201 });
}
