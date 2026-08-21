"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { RadialGlowButton } from "@/components/ui/radial-glow-button";

export function Newsletter() {
  const t = useTranslations("home.newsletter");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success(t("title"));
    setEmail("");
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-3xl text-ink sm:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-ink-soft">{t("subtitle")}</p>
        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("placeholder")}
            className="flex-1 rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink outline-none focus:border-rose-deep"
          />
          <RadialGlowButton type="submit" className="shrink-0">
            {t("cta")}
          </RadialGlowButton>
        </form>
      </motion.div>
    </section>
  );
}
