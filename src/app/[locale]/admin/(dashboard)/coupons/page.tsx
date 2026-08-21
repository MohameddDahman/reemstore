"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export default function AdminCouponsPage() {
  const coupons = useQuery(api.coupons.listAll);
  const create = useMutation(api.coupons.create);
  const remove = useMutation(api.coupons.remove);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await create({
        code,
        type,
        value: Number(value),
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        active: true,
      });
      toast.success("Coupon created");
      setCode("");
      setValue("");
      setMinOrderValue("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"coupons">) => {
    await remove({ id });
  };

  return (
    <div>
      <h1 className="font-heading text-2xl text-ink">Coupons</h1>

      <form onSubmit={submit} className="mt-6 grid gap-3 rounded-xl border border-line bg-surface p-5 sm:grid-cols-5">
        <input
          required
          placeholder="CODE"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm uppercase"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "percent" | "fixed")}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        >
          <option value="percent">% Percent</option>
          <option value="fixed">Fixed amount</option>
        </select>
        <input
          required
          type="number"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Min order (optional)"
          value={minOrderValue}
          onChange={(e) => setMinOrderValue(e.target.value)}
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-ink px-4 py-2 text-sm text-cream disabled:opacity-50"
        >
          Add Coupon
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-start text-xs uppercase tracking-widest text-ink-soft">
              <th className="px-4 py-3 text-start">Code</th>
              <th className="px-4 py-3 text-start">Discount</th>
              <th className="px-4 py-3 text-start">Used</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(coupons ?? []).map((c) => (
              <tr key={c._id}>
                <td className="px-4 py-3 font-medium text-ink" dir="ltr">{c.code}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {c.type === "percent" ? `${c.value}%` : c.value}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3 text-end">
                  <button onClick={() => handleDelete(c._id)} className="text-ink-soft hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons && coupons.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">—</p>
        )}
      </div>
    </div>
  );
}
