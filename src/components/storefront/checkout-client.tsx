"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Copy, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { useCart, cartTotals } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useCartAvailability } from "@/lib/use-cart-availability";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().min(2),
  area: z.string().optional(),
  address: z.string().min(5),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CheckoutClient() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const settings = useQuery(api.settings.get);
  const placeOrder = useMutation(api.orders.placeOrder);
  const symbol = settings?.currencySymbol ?? "";
  const { subtotal } = cartTotals(items);
  const availability = useCartAvailability();
  const remove = useCart((s) => s.remove);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const couponResult = useQuery(
    api.coupons.validate,
    appliedCode ? { code: appliedCode, subtotal } : "skip"
  );

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ orderNumber: string; phone: string } | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const discount = couponResult?.valid ? couponResult.discount ?? 0 : 0;
  const shippingFee = settings?.shippingFee ?? 0;
  const freeShippingThreshold = settings?.freeShippingThreshold;
  const effectiveShipping =
    freeShippingThreshold && subtotal - discount >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal - discount + effectiveShipping;

  const onSubmit = async (values: FormValues) => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await placeOrder({
        locale,
        customer: { name: values.name, phone: values.phone, email: values.email || undefined },
        shipping: {
          city: values.city,
          area: values.area || undefined,
          address: values.address,
          notes: values.notes || undefined,
        },
        items: items.map((i) => ({
          productId: i.productId,
          variantSku: i.variantSku,
          quantity: i.quantity,
        })),
        couponCode: couponResult?.valid ? appliedCode ?? undefined : undefined,
      });
      clear();
      setResult({ orderNumber: res.orderNumber, phone: values.phone });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message.replace(/^[.*?]s*/, "")
          : locale === "ar"
            ? "تعذر إتمام الطلب. حاولي مرة أخرى."
            : "Could not place the order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyOrderNumber = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.orderNumber);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } catch {
      // Clipboard access can be denied; the number is selectable on screen.
      setCopiedNumber(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-5 py-16 text-center sm:px-8 sm:py-24">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="h-14 w-14 text-success" />
        </motion.div>
        <h1 className="mt-6 font-heading text-3xl font-bold text-ink">{t("successTitle")}</h1>
        <p className="mt-2 text-ink-soft">{t("successSubtitle")}</p>

        {/* The order number is the only key to this order — there are no
            accounts — so it gets its own card, a copy button, and a
            direct route to tracking rather than a mention in prose. */}
        <div className="mt-6 w-full rounded-2xl border-2 border-dashed border-rose/40 bg-rose-mist p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {t("yourOrderNumber")}
          </p>
          <p
            className="mt-1.5 select-all break-all font-mono text-xl font-bold tracking-wide text-rose-deep sm:text-2xl"
            dir="ltr"
          >
            {result.orderNumber}
          </p>
          <button
            type="button"
            onClick={copyOrderNumber}
            className="mx-auto mt-3 flex items-center gap-1.5 rounded-full border border-rose/40 bg-white px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-rose-deep"
          >
            {copiedNumber ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                {t("numberCopied")}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                {t("copyNumber")}
              </>
            )}
          </button>
          <p className="mt-2.5 text-xs text-ink-soft">{t("saveNumberNote")}</p>
        </div>

        <p className="mt-4 rounded-xl bg-cream-soft p-4 text-sm text-ink-soft">
          {t("successBody", { phone: result.phone })}
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/track-order"
            className="flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm font-bold text-white"
          >
            <PackageSearch className="h-4 w-4" />
            {t("trackThisOrder")}
          </Link>
          <Link
            href="/"
            className="rounded-full border border-line px-8 py-3.5 text-sm font-bold text-ink transition-colors hover:border-ink"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center sm:px-8">
        <p className="text-ink-soft">
          {locale === "ar" ? "سلتك فارغة." : "Your cart is empty."}
        </p>
        <Link href="/" className="mt-4 inline-block text-sm text-rose-deep underline">
          {locale === "ar" ? "متابعة التسوق" : "Continue shopping"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr] md:py-20">
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-0 space-y-8">
        <h1 className="font-heading text-3xl text-ink">{t("title")}</h1>

        {availability.hasProblems && (
          <div className="rounded-xl border border-danger/40 bg-danger/5 p-4">
            <p className="text-sm font-semibold text-danger">
              {locale === "ar"
                ? "بعض المنتجات لم تعد متاحة"
                : "Some items are no longer available"}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {locale === "ar"
                ? "احذفيها من السلة لإتمام الطلب."
                : "Remove them from your bag to continue."}
            </p>
            <button
              type="button"
              onClick={() => {
                for (const item of items) {
                  if (availability.problemFor(item)) remove(item.productId, item.variantSku);
                }
              }}
              className="mt-3 rounded-full bg-ink px-5 py-2 text-xs font-semibold text-white"
            >
              {locale === "ar" ? "حذف غير المتاح" : "Remove unavailable items"}
            </button>
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold uppercase tracking-widest text-ink">
            {t("contactInfo")}
          </legend>
          <div>
            <input
              {...register("name")}
              placeholder={t("name")}
              className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-rose-deep"
            />
            {errors.name && <p className="mt-1 text-xs text-danger">{t("required")}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <input
                {...register("phone")}
                placeholder={t("phone")}
                dir="ltr"
                className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-rose-deep"
              />
              {errors.phone && <p className="mt-1 text-xs text-danger">{t("required")}</p>}
            </div>
            <input
              {...register("email")}
              placeholder={t("email")}
              dir="ltr"
              className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-rose-deep"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold uppercase tracking-widest text-ink">
            {t("shippingInfo")}
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <input
                {...register("city")}
                placeholder={t("city")}
                className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-rose-deep"
              />
              {errors.city && <p className="mt-1 text-xs text-danger">{t("required")}</p>}
            </div>
            <input
              {...register("area")}
              placeholder={t("area")}
              className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-rose-deep"
            />
          </div>
          <div>
            <input
              {...register("address")}
              placeholder={t("address")}
              className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-rose-deep"
            />
            {errors.address && <p className="mt-1 text-xs text-danger">{t("required")}</p>}
          </div>
          <textarea
            {...register("notes")}
            placeholder={t("notes")}
            rows={2}
            className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-rose-deep"
          />
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold uppercase tracking-widest text-ink">
            {t("paymentMethod")}
          </legend>
          <div className="flex items-start gap-3 rounded-xl border border-rose-deep bg-rose-mist/40 p-4">
            <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-4 border-rose-deep" />
            <div>
              <p className="text-sm font-medium text-ink">{t("cod")}</p>
              <p className="text-xs text-ink-soft">{t("codDesc")}</p>
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={submitting || availability.hasProblems}
          className="w-full rounded-full bg-ink py-4 text-sm uppercase tracking-widest text-cream transition-transform hover:scale-[1.01] disabled:opacity-50 md:hidden"
        >
          {submitting ? t("placingOrder") : t("placeOrder")}
        </button>
      </form>

      <aside className="h-fit min-w-0 rounded-2xl border border-line bg-cream-soft p-6">
        <h2 className="mb-5 font-heading text-xl text-ink">{t("orderSummary")}</h2>
        <div className="max-h-64 space-y-4 overflow-y-auto pe-1">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantSku ?? ""}`} className="flex justify-between gap-3 text-sm">
              <div>
                <p className="text-ink">
                  {item.name} {item.variantLabel ? `· ${item.variantLabel}` : ""}
                </p>
                <p className="text-ink-soft">x{item.quantity}</p>
              </div>
              <span className="shrink-0 text-ink">
                {formatPrice(item.price * item.quantity, symbol, locale)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder={tc("couponPlaceholder")}
            className="w-full min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setAppliedCode(couponInput.trim() || null)}
            className="shrink-0 rounded-full border border-ink px-4 py-2 text-xs uppercase tracking-widest text-ink"
          >
            {tc("applyCoupon")}
          </button>
        </div>
        {appliedCode && couponResult && !couponResult.valid && (
          <p className="mt-2 text-xs text-danger">{couponResult.reason}</p>
        )}
        {appliedCode && couponResult?.valid && (
          <p className="mt-2 text-xs text-success">{tc("couponApplied")}: {appliedCode.toUpperCase()}</p>
        )}

        <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>{tc("subtotal")}</span>
            <span>{formatPrice(subtotal, symbol, locale)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>{tc("discount")}</span>
              <span>-{formatPrice(discount, symbol, locale)}</span>
            </div>
          )}
          <div className="flex justify-between text-ink-soft">
            <span>{tc("shipping")}</span>
            <span>{effectiveShipping === 0 ? tc("free") : formatPrice(effectiveShipping, symbol, locale)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
            <span>{tc("total")}</span>
            <span>{formatPrice(total, symbol, locale)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={submitting || availability.hasProblems}
          className="mt-6 hidden w-full rounded-full bg-ink py-4 text-sm uppercase tracking-widest text-cream transition-transform hover:scale-[1.01] disabled:opacity-50 md:block"
        >
          {submitting ? t("placingOrder") : t("placeOrder")}
        </button>
      </aside>
    </div>
  );
}
