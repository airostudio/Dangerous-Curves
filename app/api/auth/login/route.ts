import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  try {
    const user = await login(username, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (err) {
    console.error("Login failed:", err);
    return NextResponse.json(
      { error: "Server error during login. Check that the database is configured." },
      { status: 500 }
    );
  }
}
