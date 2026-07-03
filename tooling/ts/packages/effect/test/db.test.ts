import { test, expect, describe } from "bun:test";
import { Effect } from "effect";
import { z } from "zod";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { emitV4, responseList } from "@suluk/hono";
import { effectRoute, routeGroup, rowSchema, insertSchema } from "../src/index";

// A drizzle table = the SINGLE SOURCE. `createdAt` is a timestamp (Date in the DB, epoch-ms on the wire).
const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey(),
  userId: text("userId"),
  action: text("action").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

describe("db bubble-up — the DB schema defines the request/response shapes (drizzle-zod through @suluk/effect)", () => {
  test("rowSchema derives the ROW shape from the table (timestamp column → Date)", () => {
    const Row = rowSchema(activityLog);
    expect(Row.safeParse({ id: "1", userId: null, action: "login", createdAt: new Date() }).success).toBe(true);
    // a missing required column fails — the shape is really enforced from the table.
    expect(Row.safeParse({ id: "1" }).success).toBe(false);
  });

  test("insertSchema derives the write REQUEST shape; a picked subset is a valid request body", () => {
    const Insert = insertSchema(activityLog).pick({ userId: true, action: true });
    expect(Insert.safeParse({ userId: "u1", action: "login" }).success).toBe(true);
  });

  test("a response DERIVED from the row (wire-codec delta spelled out) bubbles into the v4 doc via the envelope", () => {
    // the wire shape: reuse the DB row, override the timestamp codec (Date → epoch-ms number).
    const LogEntry = rowSchema(activityLog).omit({ createdAt: true }).extend({ createdAt: z.number().int() });
    const g = routeGroup("/api/logs");
    g.route(
      effectRoute({
        method: "get", path: "/api/logs", name: "listLogs", summary: "recent activity",
        ok: { status: 200, schema: z.object({ logs: z.array(LogEntry) }), description: "events" },
        run: () => Effect.succeed({ logs: [] }),
      }),
    );

    // the contract carries the DB-derived response…
    const [op] = responseList(g.ops[0].responses);
    expect(op.status).toBe(200);
    // …and it reaches the emitted document.
    const { document } = emitV4([...g.ops]);
    expect(document.paths["api/logs"]).toBeDefined();
  });
});
