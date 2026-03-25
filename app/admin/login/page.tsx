"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Flame className="mx-auto h-10 w-10 text-cherry" />
          <h1 className="font-rockabilly mt-3 text-3xl text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-warm-gray">Dangerous Curves Backstage</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border-2 border-cherry/30 bg-charcoal-light p-6">
          {error && (
            <div className="rounded-lg bg-cherry/20 px-3 py-2 text-sm text-cherry-light">{error}</div>
          )}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-warm-gray">
              Username
            </label>
            <Input name="username" required className="border-white/20 bg-white/5 text-white placeholder:text-white/30" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-warm-gray">
              Password
            </label>
            <Input name="password" type="password" required className="border-white/20 bg-white/5 text-white placeholder:text-white/30" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-xs text-warm-gray/60">
            Default: admin / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
