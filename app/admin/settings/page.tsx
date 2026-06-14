"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false);
    if (next !== confirm) { setError("New passwords don't match"); return; }
    setLoading(true);
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess(true); setCurrent(""); setNext(""); setConfirm("");
    } else {
      setError(data.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-brand text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-charcoal/60">Manage your admin account</p>

      <div className="mt-8 max-w-md">
        <div className="rounded-xl border-2 border-warm-gray bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-5 w-5 text-cherry" />
            <h2 className="font-bold text-lg">Change Password</h2>
          </div>

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-teal/10 px-3 py-2.5 text-sm text-teal-dark">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Password updated successfully.
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg bg-cherry/10 px-3 py-2 text-sm text-cherry">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">
                Current Password
              </label>
              <Input
                type="password"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">
                New Password
              </label>
              <Input
                type="password"
                value={next}
                onChange={e => setNext(e.target.value)}
                minLength={8}
                required
              />
              <p className="mt-1 text-xs text-charcoal/40">Minimum 8 characters</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
