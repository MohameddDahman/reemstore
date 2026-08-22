/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminAuth from "../adminAuth.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as banners from "../banners.js";
import type * as brands from "../brands.js";
import type * as categories from "../categories.js";
import type * as coupons from "../coupons.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_catalog from "../lib/catalog.js";
import type * as lib_stockImages from "../lib/stockImages.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as reviews from "../reviews.js";
import type * as seedDemoOrders from "../seedDemoOrders.js";
import type * as seedStore from "../seedStore.js";
import type * as settings from "../settings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminAuth: typeof adminAuth;
  analytics: typeof analytics;
  auth: typeof auth;
  banners: typeof banners;
  brands: typeof brands;
  categories: typeof categories;
  coupons: typeof coupons;
  files: typeof files;
  http: typeof http;
  "lib/authz": typeof lib_authz;
  "lib/catalog": typeof lib_catalog;
  "lib/stockImages": typeof lib_stockImages;
  orders: typeof orders;
  products: typeof products;
  reviews: typeof reviews;
  seedDemoOrders: typeof seedDemoOrders;
  seedStore: typeof seedStore;
  settings: typeof settings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
