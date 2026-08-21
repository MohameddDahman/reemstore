"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
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
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

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

  const handleSignOut = async () => {
    await signOut();
    router.replace("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-cream-soft">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-line bg-surface p-5 md:flex">
        <Link href="/admin" className="mb-8 font-heading text-2xl text-ink">
          Reem <span className="text-sm text-ink-soft">Admin</span>
        </Link>
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
                <Icon className="h-4 w-4" />
                {t(key)}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-line pt-4">
          {admin && <p className="px-3 text-xs text-ink-soft">{admin.name}</p>}
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-soft hover:bg-cream-soft"
          >
            <ExternalLink className="h-4 w-4" />
            {t("viewStore")}
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm text-danger hover:bg-cream-soft"
          >
            <LogOut className="h-4 w-4" />
            {t("signOut")}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
    </div>
  );
}
