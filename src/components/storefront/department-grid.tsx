"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";

/**
 * Every department, in one glance.
 *
 * The store's whole pitch is breadth, so this shows all fourteen rather
 * than a curated four — the grid itself is the argument. Each tile names
 * how many aisles sit under it, which is information the shopper can act
 * on rather than decoration.
 */
export function DepartmentGrid() {
  const locale = useLocale() as "ar" | "en";
  const tree = useQuery(api.categories.tree);

  return (
    <section className="border-y border-line bg-white py-10">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-extrabold text-ink sm:text-2xl">
              {locale === "ar" ? "تسوقي حسب القسم" : "Shop by Department"}
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              {locale === "ar"
                ? "كل ما يحتاجه البيت في مكان واحد"
                : "Everything the household needs, in one place"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-7">
          {(tree ?? Array.from({ length: 14 })).map((dept, i) =>
            dept ? (
              <motion.div
                key={dept._id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: (i % 7) * 0.04 }}
              >
                <Link
                  href={`/category/${dept.slug}`}
                  className="group flex h-full flex-col items-center rounded-xl border border-line bg-white p-3 text-center transition-all hover:-translate-y-0.5 hover:border-rose/40 hover:shadow-[0_6px_20px_-8px_rgba(215,38,61,0.35)]"
                >
                  <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-sand">
                    {dept.image && (
                      <Image
                        src={dept.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 30vw, 14vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <span
                      aria-hidden
                      className="absolute bottom-1 text-lg drop-shadow-sm ltr:left-1.5 rtl:right-1.5"
                    >
                      {dept.icon}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[12px] font-semibold leading-tight text-ink">
                    {dept.name[locale]}
                  </p>
                  <p className="mt-0.5 text-[10px] text-ink-soft">
                    {dept.subs.length} {locale === "ar" ? "قسم فرعي" : "aisles"}
                  </p>
                </Link>
              </motion.div>
            ) : (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-cream-soft" />
            )
          )}
        </div>
      </div>
    </section>
  );
}
