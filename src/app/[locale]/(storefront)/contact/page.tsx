import { getTranslations, setRequestLocale } from "next-intl/server";
import { MessageCircle, Phone, Truck, Banknote } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * Contact page.
 *
 * Deliberately not a contact form: this store runs on cash on delivery
 * and phone confirmation, so the useful thing is a number to call and an
 * order to look up — not a message that disappears into an inbox.
 */
export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });

  const cards = [
    { icon: Phone, title: t("callTitle"), body: t("callBody") },
    { icon: MessageCircle, title: t("whatsappTitle"), body: t("whatsappBody") },
    { icon: Truck, title: t("deliveryTitle"), body: t("deliveryBody") },
    { icon: Banknote, title: t("payTitle"), body: t("payBody") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <h1 className="font-heading text-3xl font-extrabold text-ink">{t("title")}</h1>
      <p className="mt-2 text-ink-soft">{t("subtitle")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-line bg-white p-5">
            <Icon className="h-5 w-5 text-rose" strokeWidth={1.6} />
            <p className="mt-3 font-semibold text-ink">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-sand p-6">
        <p className="font-semibold text-ink">{t("orderTitle")}</p>
        <p className="mt-1 text-sm text-ink-soft">{t("orderBody")}</p>
        <Link
          href="/track-order"
          className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white"
        >
          {t("orderCta")}
        </Link>
      </div>
    </div>
  );
}
