"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "@/i18n/navigation";
import { ImageUploader } from "./image-uploader";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

type VariantForm = {
  nameEn: string;
  nameAr: string;
  sku: string;
  priceOverride: string;
  stock: string;
  swatch: string;
};

const emptyVariant: VariantForm = { nameEn: "", nameAr: "", sku: "", priceOverride: "", stock: "0", swatch: "" };

export function ProductForm({ product }: { product?: Doc<"products"> }) {
  const router = useRouter();
  const categories = useQuery(api.categories.list);
  const create = useMutation(api.products.create);
  const update = useMutation(api.products.update);
  const remove = useMutation(api.products.remove);

  const [nameEn, setNameEn] = useState(product?.name.en ?? "");
  const [nameAr, setNameAr] = useState(product?.name.ar ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState<Id<"categories"> | "">(product?.categoryId ?? "");
  const [descriptionEn, setDescriptionEn] = useState(product?.description.en ?? "");
  const [descriptionAr, setDescriptionAr] = useState(product?.description.ar ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice ? String(product.compareAtPrice) : ""
  );
  const [sku, setSku] = useState(product?.sku ?? "");
  const [stock, setStock] = useState(String(product?.stock ?? "0"));
  const [tags, setTags] = useState(product?.tags.join(", ") ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [status, setStatus] = useState<"active" | "draft" | "archived">(product?.status ?? "draft");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [variants, setVariants] = useState<VariantForm[]>(
    product?.variants.map((v) => ({
      nameEn: v.name.en,
      nameAr: v.name.ar,
      sku: v.sku,
      priceOverride: v.priceOverride ? String(v.priceOverride) : "",
      stock: String(v.stock),
      swatch: v.swatch ?? "",
    })) ?? []
  );
  const [submitting, setSubmitting] = useState(false);

  const addVariant = () => setVariants([...variants, { ...emptyVariant }]);
  const updateVariant = (i: number, patch: Partial<VariantForm>) =>
    setVariants(variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Please choose a category");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: { en: nameEn, ar: nameAr },
        slug,
        description: { en: descriptionEn, ar: descriptionAr },
        shortDescription: undefined,
        categoryId,
        images,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        sku,
        variants: variants.map((v) => ({
          name: { en: v.nameEn, ar: v.nameAr },
          sku: v.sku,
          priceOverride: v.priceOverride ? Number(v.priceOverride) : undefined,
          stock: Number(v.stock),
          swatch: v.swatch || undefined,
          image: undefined,
        })),
        stock: Number(stock),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        ingredients: undefined,
        howToUse: undefined,
        featured,
        isNew,
        status,
      };

      if (product) {
        await update({ id: product._id, ...payload });
        toast.success("Product updated");
      } else {
        await create(payload);
        toast.success("Product created");
      }
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    await remove({ id: product._id });
    router.push("/admin/products");
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <div className="grid gap-3 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2">
        <input
          required
          placeholder="Name (English)"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="الاسم (عربي)"
          dir="rtl"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <select
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value as Id<"categories">)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        >
          <option value="">Select category…</option>
          {(categories ?? []).map((c) => (
            <option key={c._id} value={c._id}>
              {c.name.en}
            </option>
          ))}
        </select>
        <textarea
          required
          placeholder="Description (English)"
          value={descriptionEn}
          onChange={(e) => setDescriptionEn(e.target.value)}
          rows={3}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm sm:col-span-2"
        />
        <textarea
          required
          placeholder="الوصف (عربي)"
          dir="rtl"
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          rows={3}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm sm:col-span-2"
        />
      </div>

      <div className="grid gap-3 rounded-xl border border-line bg-surface p-5 sm:grid-cols-4">
        <input
          required
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Compare-at (optional)"
          value={compareAtPrice}
          onChange={(e) => setCompareAtPrice(e.target.value)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          required
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm sm:col-span-2"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <div className="flex items-center gap-4 text-sm text-ink">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
            New
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <p className="mb-3 text-sm font-medium text-ink">Images</p>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-ink">Variants (shades / sizes)</p>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 text-xs uppercase tracking-widest text-rose-deep"
          >
            <Plus className="h-3.5 w-3.5" /> Add variant
          </button>
        </div>
        {variants.length === 0 && (
          <p className="text-xs text-ink-soft">No variants — stock/price above apply directly.</p>
        )}
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-6">
              <input
                placeholder="Name (EN)"
                value={v.nameEn}
                onChange={(e) => updateVariant(i, { nameEn: e.target.value })}
                className="rounded-md border border-line bg-cream px-2 py-1.5 text-xs sm:col-span-1"
              />
              <input
                placeholder="الاسم (AR)"
                dir="rtl"
                value={v.nameAr}
                onChange={(e) => updateVariant(i, { nameAr: e.target.value })}
                className="rounded-md border border-line bg-cream px-2 py-1.5 text-xs sm:col-span-1"
              />
              <input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(i, { sku: e.target.value })}
                className="rounded-md border border-line bg-cream px-2 py-1.5 text-xs sm:col-span-1"
              />
              <input
                type="number"
                placeholder="Price override"
                value={v.priceOverride}
                onChange={(e) => updateVariant(i, { priceOverride: e.target.value })}
                className="rounded-md border border-line bg-cream px-2 py-1.5 text-xs sm:col-span-1"
              />
              <input
                type="number"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariant(i, { stock: e.target.value })}
                className="rounded-md border border-line bg-cream px-2 py-1.5 text-xs sm:col-span-1"
              />
              <div className="flex items-center gap-2 sm:col-span-1">
                <input
                  type="color"
                  value={v.swatch || "#c17f8b"}
                  onChange={(e) => updateVariant(i, { swatch: e.target.value })}
                  className="h-8 w-8 rounded"
                />
                <button type="button" onClick={() => removeVariant(i)} className="text-ink-soft hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-ink px-6 py-2.5 text-sm uppercase tracking-widest text-cream disabled:opacity-50"
        >
          {product ? "Save Changes" : "Create Product"}
        </button>
        {product && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full border border-danger px-6 py-2.5 text-sm uppercase tracking-widest text-danger"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
