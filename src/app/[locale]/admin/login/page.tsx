"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import { Link, useRouter } from "@/i18n/navigation";
import { ADMIN_EMAIL, ADMIN_DISPLAY_NAME } from "@/lib/admin-account";

/**
 * Password-only admin sign-in.
 *
 * The email is fixed (see `admin-account.ts`) so the operator types just a
 * password. Everything security-relevant is unchanged: Convex Auth still
 * hashes the password, issues a real session, and rate-limits attempts,
 * and every admin query/mutation still runs `requireAdmin` server-side.
 */
export default function AdminLoginPage() {
  const t = useTranslations("admin.login");
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const hasAdmin = useQuery(api.adminAuth.hasAdmin);
  const bootstrapOwner = useMutation(api.adminAuth.bootstrapOwner);
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Set while a fresh sign-up waits for the Convex client to pick up its
  // new auth token before the (auth-gated) bootstrap mutation can run.
  const [bootstrapPending, setBootstrapPending] = useState(false);

  const isSignUp = hasAdmin === false;

  useEffect(() => {
    if (!isAuthenticated || !bootstrapPending) return;
    bootstrapOwner({ name: ADMIN_DISPLAY_NAME, email: ADMIN_EMAIL })
      .then(() => router.replace("/admin"))
      .catch(() => {
        toast.error("Could not finish creating the owner account");
        setSubmitting(false);
      })
      .finally(() => setBootstrapPending(false));
  }, [isAuthenticated, bootstrapPending, bootstrapOwner, router]);

  useEffect(() => {
    if (isAuthenticated && !bootstrapPending) router.replace("/admin");
  }, [isAuthenticated, bootstrapPending, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn("password", {
        email: ADMIN_EMAIL,
        password,
        flow: isSignUp ? "signUp" : "signIn",
      });
      if (isSignUp) setBootstrapPending(true);
    } catch {
      toast.error(isSignUp ? "Could not create the account" : "Incorrect password");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-soft px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8">
        <h1 className="font-heading text-2xl text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password")}
            required
            minLength={8}
            autoFocus
            autoComplete="current-password"
            dir="ltr"
            className="w-full rounded-lg border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-rose-deep"
          />
          <button
            type="submit"
            disabled={submitting || hasAdmin === undefined}
            className="w-full rounded-full bg-ink py-3 text-sm uppercase tracking-widest text-cream disabled:opacity-50"
          >
            {submitting ? t("signingIn") : isSignUp ? t("createAndSignIn") : t("signIn")}
          </button>
        </form>

        {isSignUp && (
          <p className="mt-4 text-center text-xs text-ink-soft">{t("createAccount")}</p>
        )}

        <Link href="/" className="mt-6 block text-center text-xs text-ink-soft hover:text-ink">
          {t("backToStore")}
        </Link>
      </div>
    </div>
  );
}
