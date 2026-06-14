import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { findAdminByUsername, createSession, getSessionById, deleteSession } from "./db";
import type { AdminUser } from "./types";

const SESSION_COOKIE = "dc_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function login(username: string, password: string): Promise<AdminUser | null> {
  const user = await findAdminByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();
  await createSession(sessionId, user.id, expiresAt);

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
    await deleteSession(sessionId);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await getSessionById(sessionId);
  if (!session) return null;
  return { id: session.user_id, username: session.username };
}
