"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { Search, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { useCurrencySymbol } from "@/lib/use-currency";

export function SearchBox({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const locale = useLocale() as "ar" | "en";
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const symbol = useCurrencySymbol();

  // Debounce so we aren't issuing a Convex search query per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(id);
  }, [term]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useQuery(api.products.search, debounced ? { term: debounced } : "skip");

  const close = () => {
    setOpen(false);
    setTerm("");
    onNavigate?.();
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-full border border-line bg-cream-soft px-4 py-2 focus-within:border-ink">
        <Search className="h-4 w-4 shrink-0 text-ink-soft" />
        <input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("search")}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
        />
        {term && (
          <button onClick={() => setTerm("")} aria-label="Clear">
            <X className="h-3.5 w-3.5 text-ink-soft" />
          </button>
        )}
      </div>

      {open && debounced && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-xl">
          {results === undefined && (
            <p className="px-3 py-4 text-sm text-ink-soft">…</p>
          )}
          {results?.length === 0 && (
            <p className="px-3 py-4 text-sm text-ink-soft">
              {locale === "ar" ? "لا توجد نتائج" : "No results"}
            </p>
          )}
          {results?.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product.slug}`}
              onClick={close}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-cream-soft"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-cream-soft">
                {product.images[0] && (
                  <Image src={product.images[0]} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{product.name[locale]}</p>
                <p className="text-xs text-ink-soft">
                  {formatPrice(product.price, symbol, locale)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
