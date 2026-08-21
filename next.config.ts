import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    // Any host is allowed, so the admin can paste a product image URL from
    // anywhere (a supplier's CDN, a photographer's link, Convex storage)
    // without a code change and redeploy.
    //
    // Trade-off worth knowing: /_next/image will then optimize an image
    // from ANY origin, so a third party could use this deployment as a
    // free image-resizing proxy. Next caps that somewhat, but if it ever
    // becomes a problem, narrow this back to the handful of hosts the
    // store actually uses.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
