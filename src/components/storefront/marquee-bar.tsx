import { useTranslations } from "next-intl";

export function MarqueeBar() {
  const t = useTranslations("home.usp");
  const items = [t("shipping.title"), t("cod.title"), t("authentic.title"), t("returns.title")];
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-line bg-ink py-2">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {loop.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cream/90"
          >
            <span className="h-1 w-1 rounded-full bg-gold" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
