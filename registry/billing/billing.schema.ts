/**
 * The billing-account schema (Suluk registry: `billing`) — re-exported from `@suluk/billing`, which owns the table (the
 * user ↔ Stripe customer + active subscription link). Your drizzle config + migrations import it from here.
 */
export { billingAccount } from "@suluk/billing";
