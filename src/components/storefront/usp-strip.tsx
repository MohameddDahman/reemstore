"use client";

import { useTranslations } from "next-intl";
import { Truck, Banknote, BadgeCheck, RefreshCw } from "lucide-react";

const ITEMS = [
  { key: "shipping", icon: Truck },
  { key: "cod", icon: Banknote },
  { key: "authentic", icon: BadgeCheck },
  { key: "returns", icon: RefreshCw },
] as const;

export function UspStrip() {
  const t = useTranslations("home.usp");

  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-line px-5 sm:px-8 md:grid-cols-4 md:divide-x md:rtl:divide-x-reverse">
        {ITEMS.map(({ key, icon: Icon }) => (
          <div key={key} className="flex items-center gap-3 px-2 py-4 md:justify-center">
            <Icon className="h-5 w-5 shrink-0 text-rose" strokeWidth={1.5} />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink">{t(`${key}.title`)}</p>
              <p className="truncate text-[11px] text-ink-soft">{t(`${key}.desc`)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
