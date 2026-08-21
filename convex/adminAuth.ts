import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/** True once the store has at least one admin. Gates the "create admin
 * account" flow on the login page — after the first admin exists, the
 * sign-up form disappears and only sign-in is offered. */
export const hasAdmin = query({
  args: {},
  handler: async (ctx) => {
    const first = await ctx.db.query("admins").first();
    return first !== null;
  },
});

/** The admin profile for whoever is currently signed in, or null. */
export const currentAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("admins")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

/**
 * Promotes the signed-in user to "owner" admin. Only works the very
 * first time (i.e. while `admins` is still empty) so this can be safely
 * called from a public sign-up form without opening the dashboard to
 * anyone who registers an account later.
 */
export const bootstrapOwner = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, { name, email }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    const existing = await ctx.db.query("admins").first();
    if (existing) {
      throw new Error("An admin account already exists for this store.");
    }

    await ctx.db.insert("admins", {
      userId,
      name,
      email,
      role: "owner",
      createdAt: Date.now(),
    });
  },
});
