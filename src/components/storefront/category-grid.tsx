"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";

export function CategoryGrid() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("home.categories");
  const categories = useQuery(api.categories.list);

  if (categories && categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <h2 className="mb-6 font-heading text-xl font-bold tracking-tight text-ink sm:text-2xl">
        {t("title")}
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
        {(categories ?? []).map((cat, i) => (
          <motion.div
            key={cat._id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <Link href={`/category/${cat.slug}`} className="group block">
              <div className="relative aspect-[5/4] overflow-hidden rounded-lg bg-cream-soft">
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.name[locale]}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
                <p className="absolute bottom-3 start-3 font-heading text-sm font-bold text-white sm:text-base">
                  {cat.name[locale]}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
