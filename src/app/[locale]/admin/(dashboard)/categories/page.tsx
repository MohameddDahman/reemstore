"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

type FormState = {
  nameEn: string;
  nameAr: string;
  slug: string;
  image: string;
  featured: boolean;
};

const empty: FormState = { nameEn: "", nameAr: "", slug: "", image: "", featured: false };

export default function AdminCategoriesPage() {
  const locale = useLocale();
  const categories = useQuery(api.categories.list);
  const create = useMutation(api.categories.create);
  const remove = useMutation(api.categories.remove);
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await create({
        name: { en: form.nameEn, ar: form.nameAr },
        slug: form.slug,
        image: form.image || undefined,
        order: (categories?.length ?? 0) + 1,
        featured: form.featured,
      });
      toast.success("Category added");
      setForm(empty);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"categories">) => {
    try {
      await remove({ id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl text-ink">Categories</h1>

      <form onSubmit={submit} className="mt-6 grid gap-3 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2 lg:grid-cols-5">
        <input
          required
          placeholder="Name (English)"
          value={form.nameEn}
          onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="الاسم (عربي)"
          dir="rtl"
          value={form.nameAr}
          onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-ink px-4 py-2 text-sm text-cream disabled:opacity-50"
        >
          Add Category
        </button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(categories ?? []).map((cat) => (
          <div key={cat._id} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-ink">{cat.name[locale as "ar" | "en"]}</p>
                <p className="text-xs text-ink-soft">{cat.slug}</p>
              </div>
              <button onClick={() => handleDelete(cat._id)} className="text-ink-soft hover:text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
