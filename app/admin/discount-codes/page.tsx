"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Tag, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { DiscountCode } from "@/lib/types";

function randomCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export const dynamic = "force-dynamic";

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [code, setCode] = useState(randomCode());
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/discount-codes");
    if (res.ok) {
      const data = await res.json();
      setCodes(data.codes);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    const body: Record<string, unknown> = { code, type, value };
    if (minOrder) body.min_order = Math.round(parseFloat(minOrder) * 100);
    if (maxUses) body.max_uses = parseInt(maxUses);
    if (expiresAt) body.expires_at = new Date(expiresAt).toISOString();
    if (type === "fixed") body.value = Math.round(parseFloat(value) * 100);
    const res = await fetch("/api/admin/discount-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setShowForm(false);
      setCode(randomCode());
      setValue(""); setMinOrder(""); setMaxUses(""); setExpiresAt("");
      load();
    } else {
      setCreateError(data.error ?? "Failed to create code");
    }
    setCreating(false);
  }

  async function toggleActive(c: DiscountCode) {
    await fetch(`/api/admin/discount-codes/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this discount code?")) return;
    await fetch(`/api/admin/discount-codes/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-brand text-3xl">Discount Codes</h1>
          <p className="mt-1 text-sm text-charcoal/60">Create and manage promotional codes</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-2 h-4 w-4" />
          New Code
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 rounded-xl border-2 border-cherry bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-sm uppercase tracking-wider">New Discount Code</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Code</label>
              <div className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                  required
                />
                <button type="button" onClick={() => setCode(randomCode())} title="Generate" className="rounded-lg border-2 border-warm-gray p-2 hover:border-cherry">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Type</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setType("percentage")} className={`flex-1 rounded-lg border-2 py-2 text-sm font-semibold transition ${type === "percentage" ? "border-cherry bg-cherry/10 text-cherry" : "border-warm-gray"}`}>
                  % Percentage
                </button>
                <button type="button" onClick={() => setType("fixed")} className={`flex-1 rounded-lg border-2 py-2 text-sm font-semibold transition ${type === "fixed" ? "border-cherry bg-cherry/10 text-cherry" : "border-warm-gray"}`}>
                  $ Fixed
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">
                {type === "percentage" ? "Percentage (1–100)" : "Discount Amount ($)"}
              </label>
              <Input
                type="number"
                step={type === "fixed" ? "0.01" : "1"}
                min="1"
                max={type === "percentage" ? "100" : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "percentage" ? "e.g. 10" : "e.g. 15.00"}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Min Order ($) <span className="font-normal normal-case text-charcoal/40">optional</span></label>
              <Input type="number" step="0.01" min="0" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="e.g. 50.00" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Max Uses <span className="font-normal normal-case text-charcoal/40">optional</span></label>
              <Input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="unlimited" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-charcoal/60">Expires <span className="font-normal normal-case text-charcoal/40">optional</span></label>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>
          {createError && <p className="mt-3 text-sm text-cherry">{createError}</p>}
          <div className="mt-4 flex gap-3">
            <Button type="submit" disabled={creating}>
              {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : "Create Code"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-charcoal/50 py-10">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : codes.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-warm-gray py-16 text-center">
            <Tag className="mx-auto h-8 w-8 text-warm-gray" />
            <p className="mt-3 text-sm text-charcoal/50">No discount codes yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-warm-gray bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-warm-gray bg-cream/50">
                <tr>
                  {["Code", "Discount", "Min Order", "Usage", "Status", "Expires", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-charcoal/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-gray">
                {codes.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/30">
                    <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                    <td className="px-4 py-3">
                      {c.type === "percentage"
                        ? `${c.value}% off`
                        : `${formatPrice(c.value)} off`}
                    </td>
                    <td className="px-4 py-3 text-charcoal/60">
                      {c.min_order > 0 ? formatPrice(c.min_order) : "—"}
                    </td>
                    <td className="px-4 py-3 text-charcoal/60">
                      {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c)} className="flex items-center gap-1.5 text-xs font-semibold">
                        {c.active
                          ? <><ToggleRight className="h-4 w-4 text-teal-dark" /><span className="text-teal-dark">Active</span></>
                          : <><ToggleLeft className="h-4 w-4 text-charcoal/40" /><span className="text-charcoal/40">Inactive</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-charcoal/60">
                      {c.expires_at
                        ? new Date(c.expires_at).toLocaleDateString("en-AU")
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(c.id)} className="text-warm-gray hover:text-cherry transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
