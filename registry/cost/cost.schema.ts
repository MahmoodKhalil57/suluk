/**
 * The cost schema (Suluk registry: `cost`) — a STORAGE-owned module. `@suluk/cost` is deliberately storage-agnostic
 * (records go to a pluggable `CostSink`; the ledger reads a `CostEvent[]`), so THIS module owns the two D1 tables the
 * runtime persists into: `cost_event` (one row per recorded request/background cost) + `cost_dedup` (the at-least-once
 * dedup keys, so a redelivered webhook can't double-charge). The projection logic (`summarize`/`principalCost`) stays in
 * `@suluk/cost`; this is just where the raw events live.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/** One recorded cost — the raw, per-request/per-event picture. `breakdown` is the JSON per-source array. */
export const costEvent = sqliteTable("cost_event", {
  id: text("id").primaryKey(),
  /** the principal (user id) charged, or null when unattributed. */
  userId: text("userId"),
  operation: text("operation").notNull(),
  /** the frontend action that triggered it, if the client tagged the request. */
  action: text("action"),
  /** how the cost fired (C024): synchronous | webhook-received | scheduled | … */
  trigger: text("trigger"),
  totalMicroUsd: integer("totalMicroUsd").notNull(),
  /** 1 ⇒ totalMicroUsd is the third party's ACTUAL charge read from the payload (C026), not a declared estimate. */
  reconciled: integer("reconciled").default(0),
  /** JSON-encoded `{ source, microUsd }[]`. */
  breakdown: text("breakdown"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

/** The at-least-once dedup ledger — a background event's `dedupeKey` recorded once, so redelivery is a no-op. */
export const costDedup = sqliteTable("cost_dedup", {
  dedupeKey: text("dedupeKey").primaryKey(),
  operation: text("operation"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
