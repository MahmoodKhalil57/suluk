/**
 * The webhooks schema (Suluk registry: `webhooks`) — a STORAGE-owned module. `@suluk/payments` owns the SDK-free
 * signature VERIFICATION + the typed event ROUTER (both pure of any DB), so THIS module owns the one D1 table the
 * inbound-webhook runtime needs: `webhook_event` — the at-least-once dedup ledger. Stripe redelivers a verified event
 * until it sees a 2xx, so we record each processed event id ONCE (like `cost_dedup`); a redelivery is then a no-op.
 * Keyed on the Stripe event id (`evt_…`); the projection/routing logic stays in `@suluk/payments`.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/** The at-least-once dedup ledger — one row per PROCESSED Stripe event, so redelivery of the same `evt_…` is a no-op. */
export const webhookEvent = sqliteTable("webhook_event", {
  /** the Stripe event id (`evt_…`) — the idempotency key. */
  id: text("id").primaryKey(),
  /** the event `type` (e.g. `checkout.session.completed`), kept for auditing/inspection. */
  type: text("type").notNull(),
  /** when we processed it (unix ms). */
  processedAt: integer("processedAt", { mode: "timestamp" }).notNull(),
});
