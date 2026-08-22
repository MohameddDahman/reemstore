"use client";

import { ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Tag,
  MessageSquareText,
  Megaphone,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useScrollLock } from "@/lib/use-scroll-lock";

const NAV = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "products", href: "/admin/products", icon: Package },
  { key: "categories", href: "/admin/categories", icon: FolderTree },
  { key: "orders", href: "/admin/orders", icon: ShoppingBag },
  { key: "coupons", href: "/admin/coupons", icon: Tag },
  { key: "banners", href: "/admin/banners", icon: Megaphone },
  { key: "reviews", href: "/admin/reviews", icon: MessageSquareText },
  { key: "settings", href: "/admin/settings", icon: Settings },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const admin = useQuery(api.adminAuth.currentAdmin);
  const [menuOpen, setMenuOpen] = useState(false);
  useScrollLock(menuOpen);

  // Close the mobile drawer on navigation. Adjusted during render (React's
  // recommended pattern for resetting state on a changing value) instead of
  // in an effect, to avoid an extra commit.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace("/admin/login");
  };

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map(({ key, href, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={key}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream-soft"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );

  const footerLinks = (
    <div className="space-y-1 border-t border-line pt-4">
      {admin && <p className="truncate px-3 text-xs text-ink-soft">{admin.name}</p>}
      <Link
        href="/"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-soft hover:bg-cream-soft"
      >
        <ExternalLink className="h-4 w-4 shrink-0" />
        {t("viewStore")}
      </Link>
      <button
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm text-danger hover:bg-cream-soft"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {t("signOut")}
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cream-soft">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-e border-line bg-surface p-5 md:flex">
        <Link href="/admin" className="mb-8 font-heading text-2xl text-ink">
          Reem <span className="text-sm text-ink-soft">Admin</span>
        </Link>
        {navLinks}
        {footerLinks}
      </aside>

      {/* Mobile drawer — without this the admin has no navigation at all
          below md, leaving every page except the dashboard unreachable. */}
      <AnimatePresence>
        {menuOpen && [
          <motion.div
            key="admin-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ink/40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />,
          <motion.aside
            key="admin-nav-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-y-0 start-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto overscroll-contain border-e border-line bg-surface p-5 md:hidden rtl:[--tw-enter-translate-x:100%]"
          >
            <div className="mb-6 flex items-center justify-between">
              <Link href="/admin" className="font-heading text-xl text-ink">
                Reem <span className="text-sm text-ink-soft">Admin</span>
              </Link>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5 text-ink" />
              </button>
            </div>
            {navLinks}
            {footerLinks}
          </motion.aside>,
        ]}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
          <button onClick={() => setMenuOpen(true)} aria-label={t("dashboard")}>
            <Menu className="h-6 w-6 text-ink" />
          </button>
          <Link href="/admin" className="font-heading text-lg text-ink">
            Reem <span className="text-xs text-ink-soft">Admin</span>
          </Link>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
