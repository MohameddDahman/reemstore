"use client";

import { useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "@/i18n/navigation";

export default function AdminLogoutPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  useEffect(() => {
    signOut().finally(() => router.replace("/admin/login"));
  }, [signOut, router]);

  return null;
}
