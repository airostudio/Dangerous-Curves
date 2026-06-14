import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { checkRateLimit, recordLoginAttempt, clearLoginAttempts } from "@/lib/db";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait 15 minutes before trying again." },
      { status: 429 }
    );
  }

  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  await recordLoginAttempt(ip);

  try {
    const user = await login(username, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await clearLoginAttempts(ip);
    return NextResponse.json({ user });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Login failed — check that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Vercel." },
      { status: 500 }
    );
  }
}
