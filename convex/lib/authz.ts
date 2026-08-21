import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Throws unless the caller is signed in AND has a row in `admins`.
 * Use at the top of every admin-only query/mutation. Returns the admin
 * doc so callers can read `role` without a second lookup.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not signed in");
  }
  const admin = await ctx.db
    .query("admins")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (!admin) {
    throw new Error("Not authorized");
  }
  return admin;
}
