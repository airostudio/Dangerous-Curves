import { cookies } from "next/headers";
import { getDb } from "./db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import type { AdminUser } from "./types";

const SESSION_COOKIE = "dc_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function login(username: string, password: string): Promise<AdminUser | null> {
  const db = getDb();
  const user = db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username) as {
    id: number;
    username: string;
    password_hash: string;
  } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();

  // Clean old sessions for this user
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);
  db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(sessionId, user.id, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return { id: user.id, username: user.username };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    const db = getDb();
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const db = getDb();
  const session = db.prepare(`
    SELECT s.*, u.username FROM sessions s
    JOIN admin_users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `).get(sessionId) as { user_id: number; username: string } | undefined;

  if (!session) return null;
  return { id: session.user_id, username: session.username };
}
