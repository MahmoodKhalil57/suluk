import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { nanoid } from "../app";
import { user } from "../db/auth";

export const todo = sqliteTable(
  "todo",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid())
      .zod((s) => s.nanoid().meta({ description: "The todo's unique id (nanoid).", examples: ["V1StGXR8_Z5jdHi6B-myT"] })),
    userId: text("userId").notNull().references(() => user.id)
      .zod((s) => s.meta({ description: "The owner's user id — the authenticated principal." })),
    title: text("title").notNull()
      .zod((s) =>
        s
          .trim()
          .min(1)
          .max(500)
          .regex(/^[\p{L}\p{N}\p{P}\p{Zs}]+$/u, "Title must contain only letters, numbers, punctuation, and spaces.")
          .meta({ description: "The todo text.", examples: ["Buy milk"] }),
      ),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false)
      .zod((s) => s.meta({ description: "Whether the todo is done.", examples: [false] })),
    createdAt: integer("createdAt").notNull()
      .zod((s) => s.int().min(0).max(new Date("2100-01-01").getTime()).meta({ description: "When it was created — epoch milliseconds.", examples: [1783082151484] })),
    updatedAt: integer("updatedAt").notNull()
      .zod((s) => s.int().min(0).max(new Date("2100-01-01").getTime()).meta({ description: "When it was last updated — epoch milliseconds.", examples: [1783082151484] })),
  },
  (t) => ({ byUser: index("todo_userId_idx").on(t.userId) }),
).zod((s) => s.meta({ description: "A todo item." }));
