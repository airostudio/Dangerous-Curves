"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, CheckCircle, Truck, DollarSign, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border-2 border-warm-gray bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-5 w-5 text-cherry" />
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  // Password change
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // Shipping settings
  const [auspostKey, setAuspostKey] = useState("");
  const [senderPostcode, setSenderPostcode] = useState("");
  const [handlingFee, setHandlingFee] = useState("0.00");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [shippingSuccess, setShippingSuccess] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(({ settings }) => {
        setAuspostKey(settings.auspost_api_key ?? "");
        setSenderPostcode(settings.sender_postcode ?? "");
        const feeCents = parseInt(settings.handling_fee_cents ?? "0", 10) || 0;
        setHandlingFee((feeCents / 100).toFixed(2));
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwSuccess(false);
    if (next !== confirm) { setPwError("New passwords don't match"); return; }
    setPwLoading(true);
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    if (res.ok) { setPwSuccess(true); setCurrent(""); setNext(""); setConfirm(""); }
    else { setPwError(data.error ?? "Something went wrong"); }
    setPwLoading(false);
  }

  async function handleShipping(e: React.FormEvent) {
    e.preventDefault();
    setShippingError(""); setShippingSuccess(false);
    setShippingLoading(true);
    const handlingCents = Math.round(parseFloat(handlingFee || "0") * 100);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auspost_api_key: auspostKey.trim(),
        sender_postcode: senderPostcode.trim(),
        handling_fee_cents: String(handlingCents),
      }),
    });
    if (res.ok) { setShippingSuccess(true); setTimeout(() => setShippingSuccess(false), 3000); }
    else { setShippingError("Failed to save settings"); }
    setShippingLoading(false);
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-brand text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-charcoal/60">Manage your store configuration</p>

      <div className="mt-8 max-w-xl space-y-6">
        {/* Shipping & AusPost */}
        <SectionCard title="Shipping Configuration" icon={Truck}>
          {settingsLoading ? (
            <div className="flex items-center gap-2 text-sm text-charcoal/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <form onSubmit={handleShipping} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">
                  AusPost API Key
                </label>
                <Input
                  type="password"
                  value={auspostKey}
                  onChange={(e) => setAuspostKey(e.target.value)}
                  placeholder="Your AusPost API key"
                />
                <p className="mt-1 text-xs text-charcoal/40">
                  Get yours at auspost.com.au/business/developer-tools
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">
                  Your Postcode (sender)
                </label>
                <Input
                  value={senderPostcode}
                  onChange={(e) => setSenderPostcode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="e.g. 3000"
                  maxLength={4}
                />
                <p className="mt-1 text-xs text-charcoal/40">The postcode you ship from</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">
                  Handling Fee (per order)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-charcoal/50">$</span>
                  <Input
                    type="number"
                    step="0.10"
                    min="0"
                    value={handlingFee}
                    onChange={(e) => setHandlingFee(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-charcoal/40">Added to AusPost rate shown to customer</p>
              </div>
              {shippingError && <p className="text-xs text-cherry">{shippingError}</p>}
              {shippingSuccess && (
                <div className="flex items-center gap-2 text-sm text-teal-dark">
                  <CheckCircle className="h-4 w-4" /> Saved.
                </div>
              )}
              <Button type="submit" disabled={shippingLoading}>
                {shippingLoading ? "Saving…" : "Save Shipping Settings"}
              </Button>
            </form>
          )}
        </SectionCard>

        {/* Password */}
        <SectionCard title="Change Password" icon={Shield}>
          {pwSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-teal/10 px-3 py-2.5 text-sm text-teal-dark">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Password updated successfully.
            </div>
          )}
          {pwError && (
            <div className="mb-4 rounded-lg bg-cherry/10 px-3 py-2 text-sm text-cherry">{pwError}</div>
          )}
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Current Password</label>
              <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">New Password</label>
              <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} minLength={8} required />
              <p className="mt-1 text-xs text-charcoal/40">Minimum 8 characters</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Confirm New Password</label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" disabled={pwLoading} className="w-full">
              {pwLoading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </SectionCard>

        {/* Handling fee context card */}
        <SectionCard title="Pricing Notes" icon={DollarSign}>
          <p className="text-sm text-charcoal/60">
            All product prices are stored in cents. The handling fee is added on top of the
            AusPost calculated rate at checkout. Discount codes can be managed under{" "}
            <a href="/admin/discount-codes" className="font-semibold text-cherry underline">
              Discount Codes
            </a>.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
