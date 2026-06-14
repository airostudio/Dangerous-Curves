import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllSettings, setSettings } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getAllSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as Record<string, string>;
  await setSettings(body);
  return NextResponse.json({ success: true });
}
