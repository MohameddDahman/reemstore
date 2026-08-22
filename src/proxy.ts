// Next 16 renamed the `middleware` file convention to `proxy`; the
// behaviour is identical. Convex Auth's wrapper is still the default
// export, so only the filename changes.
import {
  convexAuthNextjsMiddleware,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

// Matches /ar/admin/... or /en/admin/... but not the login page itself.
const ADMIN_PATH = /^\/(ar|en)\/admin(?!\/login\b)(\/.*)?$/;

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const { pathname } = request.nextUrl;

  // Any other /api routes (non-auth) should never go through locale
  // routing or the admin-page gate below.
  if (pathname.startsWith("/api")) {
    return;
  }

  if (ADMIN_PATH.test(pathname)) {
    const authenticated = await convexAuth.isAuthenticated();
    if (!authenticated) {
      const locale = pathname.split("/")[1];
      return nextjsMiddlewareRedirect(request, `/${locale}/admin/login`);
    }
  }

  return handleI18nRouting(request);
});

export const config = {
  // Convex Auth proxies sign-in/sign-out requests through /api/auth, so
  // that path must still pass through here (it's handled internally by
  // convexAuthNextjsMiddleware before our handler runs).
  matcher: ["/((?!trpc|_next|_vercel|.*\\..*).*)"],
};
