/**
 * The Cloudflare provider. The Suluk stack is already Cloudflare-native, so this is an ADAPTER not a rewrite:
 *   - the Hono `app` is a valid Worker default export      → Workers
 *   - the data floor is sqlite-core                          → D1 (which IS SQLite)
 *   - the built frontend is static assets                    → the Worker's `assets` binding (SPA fallback)
 * generate() produces the files + the ordered wrangler steps; the host (the vscode extension) runs the steps
 * in a terminal AFTER the user authenticates (`wrangler login`, OAuth), so credentials never touch this code.
 */
import { schemaToSql } from "./sql";
import type { DeployInput, DeployPlan, DeployProvider, DurableObjectBinding } from "./types";

export const DEFAULT_COMPAT_DATE = "2026-06-01";

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "suluk-app";
}

/** The wrangler.jsonc `migrations` entry that CREATES the same-script DO classes — SQLite-backed by default (the
 *  Agents SDK + free-plan requirement). Cross-script classes (those with a `scriptName`) are migrated by their
 *  owning script, so they are bound but NOT listed here. Returns [] when there is nothing same-script to create. */
function durableObjectMigrations(dos: DurableObjectBinding[], tag: string): { tag: string; new_sqlite_classes?: string[]; new_classes?: string[] }[] {
  const owned = dos.filter((d) => !d.scriptName); // you only migrate classes YOUR script defines
  const sqliteClasses = owned.filter((d) => d.sqlite !== false).map((d) => d.className);
  const classes = owned.filter((d) => d.sqlite === false).map((d) => d.className);
  if (!sqliteClasses.length && !classes.length) return [];
  return [{ tag, ...(sqliteClasses.length ? { new_sqlite_classes: sqliteClasses } : {}), ...(classes.length ? { new_classes: classes } : {}) }];
}

function wranglerConfig(input: DeployInput, name: string): string {
  const config = {
    $schema: "node_modules/wrangler/config-schema.json",
    name,
    compatibility_date: input.compatibilityDate ?? DEFAULT_COMPAT_DATE,
    compatibility_flags: ["nodejs_compat"],
    main: "worker.ts",
    // D1: the database_id is filled in after `wrangler d1 create` (step 1). On a PREVIEW build, the same isolated
    // `${name}-db` is also bound as PREVIEW_DB — the second fail-closed lock previewLoginHandler checks for.
    d1_databases: input.preview
      ? [
          { binding: "DB", database_name: `${name}-db`, database_id: "<run: wrangler d1 create>" },
          { binding: "PREVIEW_DB", database_name: `${name}-db`, database_id: "<run: wrangler d1 create>" },
        ]
      : [{ binding: "DB", database_name: `${name}-db`, database_id: "<run: wrangler d1 create>" }],
    // PREVIEW lock 1: the deploy-time flag. A prod config NEVER sets this; previewLoginHandler 404s without it.
    ...(input.preview ? { vars: { SULUK_PREVIEW: "1" } } : {}),
    // Durable Object agents (Cloudflare Agents SDK runtime): bind each class + an additive migration that creates it.
    // Gated on `durableObjects` so a non-agent deploy emits exactly what it did before.
    ...(input.durableObjects?.length
      ? {
          durable_objects: {
            bindings: input.durableObjects.map((d) => ({ name: d.binding, class_name: d.className, ...(d.scriptName ? { script_name: d.scriptName } : {}) })),
          },
          // migrations are omitted entirely when every class is cross-script (migrated by its owning script).
          ...((m) => (m.length ? { migrations: m } : {}))(durableObjectMigrations(input.durableObjects, input.durableObjectMigrationTag ?? "v1")),
        }
      : {}),
    // static assets (the built frontend); SPA fallback so client routes resolve.
    assets: { directory: input.assetsDir ?? "./dist/client", binding: "ASSETS", not_found_handling: "single-page-application" },
    observability: { enabled: true },
  };
  return JSON.stringify(config, null, 2) + "\n";
}

/** A seed.sql for a PREVIEW deployment: ONE throwaway demo user per role (never a real row). The preview-login
 *  gate binds a session to exactly these seeded principals. Adjust the columns to your deployed auth schema. */
function seedSql(roles: string[]): string {
  // role names are interpolated into SQL — and the contract that declares them may be third-party (a module or a
  // remote registry). Allow ONLY a safe identifier charset; SKIP anything else rather than emit injectable SQL.
  // (Fail-safe: a skipped role simply has no seeded user, so the gate cannot log anyone in as it.)
  const SAFE = /^[A-Za-z0-9_-]{1,40}$/;
  const candidates = roles.filter((r) => r && r !== "anonymous");
  const seedable = candidates.filter((r) => SAFE.test(r));
  const skipped = candidates.filter((r) => !SAFE.test(r));
  const rows = seedable
    .map((r) => `INSERT INTO user (id, email, name, role) VALUES ('preview-${r}', '${r}@preview.local', 'Preview ${r}', '${r}');`)
    .join("\n");
  const skipNote = skipped.length ? `\n-- SKIPPED ${skipped.length} role(s) with unsafe characters (not seeded — they cannot be previewed).` : "";
  return `-- CANDIDATE — generated by @suluk/deploy for a PREVIEW deployment ONLY.
-- One THROWAWAY demo user per declared role; the /preview/login gate binds a session to exactly these rows.
-- These are NOT real users and must never exist in a production database. Adjust columns to your auth schema.
${rows || "-- (no non-anonymous roles declared by the contract)"}${skipNote}
`;
}

function workerEntry(input: DeployInput): string {
  const appModule = input.appModule ?? "./src/app";
  return `// CANDIDATE — generated by @suluk/deploy. The Cloudflare Worker entry.
// The Hono app is a valid Worker default export; static assets are served by the ASSETS binding (SPA fallback),
// and env.DB is the D1 database (use drizzle-orm/d1 in your handlers).
import { app } from ${JSON.stringify(appModule)};

export default app;
`;
}

/** The Cloudflare deployment provider. */
export const cloudflare: DeployProvider = {
  name: "cloudflare",
  generate(input: DeployInput): DeployPlan {
    const name = input.preview ? `${slug(input.name)}-preview` : slug(input.name);
    const dbName = `${name}-db`;
    const files = [
      { path: "wrangler.jsonc", content: wranglerConfig(input, name) },
      { path: "worker.ts", content: workerEntry(input) },
      { path: "schema.sql", content: schemaToSql(input.entities) },
    ];
    if (input.preview) files.push({ path: "seed.sql", content: seedSql(input.previewRoles ?? []) });

    const steps = [
      { cmd: "wrangler login", note: "authenticate with your Cloudflare account (OAuth in the browser). Or set CLOUDFLARE_API_TOKEN." },
      { cmd: `wrangler d1 create ${dbName}`, note: input.preview ? `create the D1 database, then paste its database_id into BOTH d1 entries (DB and PREVIEW_DB — they reference the same database) in wrangler.jsonc.` : `create the D1 database, then paste its database_id into wrangler.jsonc (replacing the placeholder).` },
      { cmd: `wrangler d1 execute ${dbName} --file=./schema.sql --remote`, note: "apply the generated schema to the remote D1 database." },
      ...(input.preview ? [{ cmd: `wrangler d1 execute ${dbName} --file=./seed.sql --remote`, note: "seed the throwaway demo users (one per role) the /preview/login gate logs you in as." }] : []),
      { cmd: "wrangler deploy", note: "deploy the Worker (the Hono API) together with the static assets (your frontend)." },
      ...(input.preview ? [{ cmd: `wrangler delete --name ${name}`, note: "TEAR DOWN the preview when done — a standing preview is a live credentialed surface (the /preview/login backdoor). Also `wrangler d1 delete ${dbName}`." }] : []),
    ];

    const notes = input.preview
      ? [
          "PREVIEW deployment — role-preview only. The Worker mounts /preview/login ONLY because two independent locks both say preview: the `SULUK_PREVIEW=\"1\"` var AND the `PREVIEW_DB` binding. A production deploy sets NEITHER, so the backdoor login is inert there.",
          "/preview/login binds a session to a SEEDED throwaway demo user (seed.sql) — never a real row. The preview DB is isolated (`" + dbName + "`), separate from production data.",
          "After `wrangler d1 create`, paste the printed database_id into BOTH d1 entries (DB and PREVIEW_DB) in wrangler.jsonc — they bind the same database under two names (PREVIEW_DB is the second fail-closed lock).",
          "TTL / single-use is the Worker's Better Auth SESSION policy — keep preview sessions short. The preview env is EPHEMERAL: tear it down (`wrangler delete`) when finished; do not leave it standing.",
          "Auth happens in the terminal via `wrangler login` (OAuth) — credentials never pass through Suluk.",
          "Swappable by design: this is the `cloudflare` DeployProvider; other targets implement the same interface.",
        ]
      : [
          "Auth happens in the terminal via `wrangler login` (OAuth) — credentials never pass through Suluk.",
          "After step 2, replace the `database_id` placeholder in wrangler.jsonc with the id `wrangler d1 create` printed.",
          `Build your frontend into "${input.assetsDir ?? "./dist/client"}" before \`wrangler deploy\` (it is served by the ASSETS binding).`,
          "Swappable by design: this is the `cloudflare` DeployProvider; other targets implement the same interface.",
        ];

    if (input.durableObjects?.length) {
      const owned = input.durableObjects.filter((d) => !d.scriptName).map((d) => d.className);
      notes.push(
        `Durable Object agents (Cloudflare Agents SDK): ${input.durableObjects.map((d) => `${d.binding}→${d.className}`).join(", ")} are bound in wrangler.jsonc; ` +
          (owned.length ? `\`wrangler deploy\` creates ${owned.join(", ")} via the \`migrations\` entry (SQLite-backed). ` : "") +
          "This is a FIRST-DEPLOY artifact: the generator emits the CURRENT class set only (no prev-diff), so EVOLVING agents is a hand-edit — to add a class, append a new entry `{ tag: \"v2\", new_sqlite_classes: [<only the new class>] }`; removing an agent silently drops its class (its stored DO state is orphaned with NO warning — a manual, data-losing decision, unlike the additive D1 migrationSql which flags removals).",
      );
    }

    return { provider: "cloudflare", files, steps, notes };
  },
};
