"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

type BannerType = "popup" | "topbar" | "hero";

const empty = {
  type: "popup" as BannerType,
  couponCode: "",
  titleEn: "",
  titleAr: "",
  subtitleEn: "",
  subtitleAr: "",
  image: "",
  ctaTextEn: "",
  ctaTextAr: "",
  ctaLink: "",
};

export default function AdminBannersPage() {
  const banners = useQuery(api.banners.listAll);
  const create = useMutation(api.banners.create);
  const update = useMutation(api.banners.update);
  const remove = useMutation(api.banners.remove);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await create({
        type: form.type,
        couponCode: form.couponCode || undefined,
        title: { en: form.titleEn, ar: form.titleAr },
        subtitle: form.subtitleEn || form.subtitleAr ? { en: form.subtitleEn, ar: form.subtitleAr } : undefined,
        image: form.image || undefined,
        ctaText: form.ctaTextEn || form.ctaTextAr ? { en: form.ctaTextEn, ar: form.ctaTextAr } : undefined,
        ctaLink: form.ctaLink || undefined,
        active: true,
        order: (banners?.length ?? 0) + 1,
      });
      toast.success("Promo popup created");
      setForm(empty);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (banner: NonNullable<typeof banners>[number]) => {
    await update({
      id: banner._id,
      type: banner.type,
      couponCode: banner.couponCode,
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      active: !banner.active,
      startsAt: banner.startsAt,
      endsAt: banner.endsAt,
      order: banner.order,
    });
  };

  const handleDelete = async (id: Id<"banners">) => remove({ id });

  return (
    <div>
      <h1 className="font-heading text-2xl text-ink">Promo Popups</h1>
      <p className="mt-1 text-sm text-ink-soft">
        The active &ldquo;popup&rdquo; banner appears to shoppers ~1.5s after they land on the site.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3 rounded-xl border border-line bg-surface p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as BannerType })}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
          >
            <option value="popup">Entry Popup</option>
            <option value="topbar">Top Bar</option>
            <option value="hero">Hero Banner</option>
          </select>
          <input
            placeholder="Coupon code revealed by the popup (e.g. REEM15)"
            value={form.couponCode}
            onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm uppercase"
          />
          <input
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Title (English)"
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="العنوان (عربي)"
            dir="rtl"
            value={form.titleAr}
            onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
          />
          <input
            placeholder="Subtitle (English)"
            value={form.subtitleEn}
            onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
          />
          <input
            placeholder="النص الفرعي (عربي)"
            dir="rtl"
            value={form.subtitleAr}
            onChange={(e) => setForm({ ...form, subtitleAr: e.target.value })}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
          />
          <input
            placeholder="Button text (English)"
            value={form.ctaTextEn}
            onChange={(e) => setForm({ ...form, ctaTextEn: e.target.value })}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
          />
          <input
            placeholder="نص الزر (عربي)"
            dir="rtl"
            value={form.ctaTextAr}
            onChange={(e) => setForm({ ...form, ctaTextAr: e.target.value })}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
          />
        </div>
        <input
          placeholder="Button link, e.g. /category/skincare"
          value={form.ctaLink}
          onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
          className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-ink px-4 py-2 text-sm text-cream disabled:opacity-50"
        >
          Create
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {(banners ?? []).map((banner) => (
          <div
            key={banner._id}
            className="flex items-center justify-between rounded-xl border border-line bg-surface p-4"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-soft">{banner.type}</p>
              <p className="font-medium text-ink">{banner.title.en}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleActive(banner)}
                className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-widest ${
                  banner.active ? "bg-success/15 text-success" : "bg-line text-ink-soft"
                }`}
              >
                {banner.active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => handleDelete(banner._id)} className="text-ink-soft hover:text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
