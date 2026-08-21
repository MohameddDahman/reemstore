/**
 * The single admin identity the dashboard signs in as.
 *
 * The login form asks only for a password, so the email half of the
 * credential is fixed here rather than typed. This is NOT a secret — it
 * ships in the client bundle — it just gives Convex Auth a stable account
 * to hash the password against, so sessions, rate limiting and the
 * server-side `requireAdmin` check all keep working unchanged.
 */
export const ADMIN_EMAIL = "admin@reem.com";
export const ADMIN_DISPLAY_NAME = "Reem Admin";
