/**
 * The erasure schema (Suluk registry: `erasure`) — a STORAGE-owned module. `@suluk/better-auth` owns the cascade LOGIC;
 * this module owns one table: `erasure_receipt`, the GDPR compliance audit trail (who was erased, when, which steps ran).
 * The receipt is written AFTER the cascade succeeds, so a failed (aborted) erasure leaves no false "erased" record.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const erasureReceipt = sqliteTable("erasure_receipt", {
  id: text("id").primaryKey(),
  /** the erased principal — kept as the audit subject (a bare id string, no FK to the now-deleted user row). */
  userId: text("userId").notNull(),
  /** "delete" | "anonymize" | "mixed" — which posture the cascade used. */
  posture: text("posture"),
  /** JSON array of the cascade step names that ran. */
  steps: text("steps"),
  erasedAt: integer("erasedAt", { mode: "timestamp" }).notNull(),
});
