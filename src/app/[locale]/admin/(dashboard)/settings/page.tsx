"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

export default function AdminSettingsPage() {
  const settings = useQuery(api.settings.get);

  return (
    <div>
      <h1 className="font-heading text-2xl text-ink">Settings</h1>
      {/* Keyed on whether settings has loaded so the form below only ever
          mounts once, with the real values as its initial state — no
          effect needed to patch it after the fact. */}
      {settings !== undefined && <SettingsForm key={settings?._id ?? "new"} settings={settings} />}
    </div>
  );
}

function SettingsForm({ settings }: { settings: Doc<"settings"> | null }) {
  const upsert = useMutation(api.settings.upsert);
  const [form, setForm] = useState({
    storeNameEn: settings?.storeName.en ?? "",
    storeNameAr: settings?.storeName.ar ?? "",
    currency: settings?.currency ?? "EGP",
    currencySymbol: settings?.currencySymbol ?? "",
    shippingFee: String(settings?.shippingFee ?? "0"),
    freeShippingThreshold: settings?.freeShippingThreshold ? String(settings.freeShippingThreshold) : "",
    phone: settings?.phone ?? "",
    whatsapp: settings?.whatsapp ?? "",
    instagram: settings?.instagram ?? "",
    tiktok: settings?.tiktok ?? "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsert({
        storeName: { en: form.storeNameEn, ar: form.storeNameAr },
        currency: form.currency,
        currencySymbol: form.currencySymbol,
        shippingFee: Number(form.shippingFee),
        freeShippingThreshold: form.freeShippingThreshold ? Number(form.freeShippingThreshold) : undefined,
        phone: form.phone || undefined,
        whatsapp: form.whatsapp || undefined,
        instagram: form.instagram || undefined,
        tiktok: form.tiktok || undefined,
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 max-w-2xl space-y-6">
      <div className="grid gap-3 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2">
        <input
          placeholder="Store name (English)"
          value={form.storeNameEn}
          onChange={(e) => setForm({ ...form, storeNameEn: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          placeholder="اسم المتجر (عربي)"
          dir="rtl"
          value={form.storeNameAr}
          onChange={(e) => setForm({ ...form, storeNameAr: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          placeholder="Currency code (e.g. EGP)"
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          placeholder="Currency symbol (e.g. L.E)"
          value={form.currencySymbol}
          onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Shipping fee"
          value={form.shippingFee}
          onChange={(e) => setForm({ ...form, shippingFee: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Free shipping over (optional)"
          value={form.freeShippingThreshold}
          onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-3 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2">
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          placeholder="WhatsApp"
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          placeholder="Instagram handle"
          value={form.instagram}
          onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          placeholder="TikTok handle"
          value={form.tiktok}
          onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
      </div>

      <button type="submit" className="rounded-lg bg-ink px-6 py-2.5 text-sm text-cream">
        Save Settings
      </button>
    </form>
  );
}
