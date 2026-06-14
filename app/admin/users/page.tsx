"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2, Users, KeyRound } from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminUser {
  id: number;
  username: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Add user form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Reset password
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setCurrentUserId(data.current_user_id);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (password !== confirmPassword) { setCreateError("Passwords don't match"); return; }
    if (password.length < 8) { setCreateError("Password must be at least 8 characters"); return; }
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
    });
    const data = await res.json();
    if (res.ok) {
      setShowForm(false);
      setUsername(""); setPassword(""); setConfirmPassword("");
      load();
    } else {
      setCreateError(data.error ?? "Failed to create user");
    }
    setCreating(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this admin user? This cannot be undone.")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetError(""); setResetSuccess(false);
    if (newPassword.length < 8) { setResetError("Minimum 8 characters"); return; }
    setResetting(true);
    const res = await fetch(`/api/admin/users/${resetUserId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await res.json();
    if (res.ok) { setResetSuccess(true); setNewPassword(""); setTimeout(() => { setResetUserId(null); setResetSuccess(false); }, 2000); }
    else { setResetError(data.error ?? "Failed to reset password"); }
    setResetting(false);
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-brand text-3xl">Admin Users</h1>
          <p className="mt-1 text-sm text-charcoal/60">Manage who can access the admin panel</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 rounded-xl border-2 border-cherry bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">New Admin User</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. jane" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min. 8 chars" required minLength={8} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Confirm Password</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="repeat password" required />
            </div>
          </div>
          {createError && <p className="mt-3 text-sm text-cherry">{createError}</p>}
          <div className="mt-4 flex gap-3">
            <Button type="submit" disabled={creating}>
              {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : "Create User"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Users list */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-charcoal/50 py-10">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border-2 border-warm-gray bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-warm-gray bg-cream/50">
                <tr>
                  {["Username", "Role", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-charcoal/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-gray">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-cream/30">
                    <td className="px-4 py-3 font-semibold">
                      {u.username}
                      {u.id === currentUserId && (
                        <span className="ml-2 rounded-full bg-cherry/10 px-2 py-0.5 text-xs text-cherry">You</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-charcoal/60">Administrator</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setResetUserId(u.id); setNewPassword(""); setResetError(""); setResetSuccess(false); }}
                          className="flex items-center gap-1.5 rounded-lg border border-warm-gray px-2 py-1 text-xs hover:border-charcoal/50"
                        >
                          <KeyRound className="h-3 w-3" /> Reset PW
                        </button>
                        {u.id !== currentUserId && (
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="text-warm-gray transition hover:text-cherry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset password modal */}
      {resetUserId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border-2 border-charcoal bg-white p-6 shadow-2xl">
            <h2 className="mb-4 font-bold">Reset Password</h2>
            <p className="mb-4 text-sm text-charcoal/60">
              Enter a new password for <strong>{users.find((u) => u.id === resetUserId)?.username}</strong>.
            </p>
            {resetSuccess ? (
              <p className="text-sm font-semibold text-teal-dark">Password updated!</p>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min. 8 chars)"
                  minLength={8}
                  required
                  autoFocus
                />
                {resetError && <p className="text-xs text-cherry">{resetError}</p>}
                <div className="flex gap-3">
                  <Button type="submit" disabled={resetting} className="flex-1">
                    {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setResetUserId(null)}>Cancel</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="rounded-xl border-2 border-dashed border-warm-gray py-16 text-center">
          <Users className="mx-auto h-8 w-8 text-warm-gray" />
          <p className="mt-3 text-sm text-charcoal/50">No admin users found.</p>
        </div>
      )}
    </div>
  );
}
