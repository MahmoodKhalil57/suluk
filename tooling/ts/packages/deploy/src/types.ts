/**
 * The deployment abstraction — SWAPPABLE by design. A provider turns a Suluk app into the files + the ordered
 * steps that ship it. Cloudflare is the first provider; the interface is the contract every future target
 * (Vercel, Fly, a self-hosted Node box) implements. The user's CLAUDE-stated wish — "good standards we can
 * swap out in the future" — is exactly this interface.
 */
import type { SchemaOrRef } from "@suluk/core";

export interface DeployEntity {
  name: string;
  schema: SchemaOrRef;
}

/**
 * A Durable Object class to bind + migrate. The Cloudflare Agents SDK runs each agent as a SQLite-backed Durable
 * Object, so a deploy that ships agents must emit BOTH a `durable_objects.bindings` entry AND a `migrations` entry
 * that creates the class. `@suluk/deploy` stays decoupled from the agent contract: the CALLER (the cockpit, or
 * `@suluk/agents`' future `projectCloudflareAgent`) computes which agents are Durable Objects and passes them here.
 */
export interface DurableObjectBinding {
  /** the binding name exposed as `env.<binding>` (e.g. "WeatherAssistant"). */
  binding: string;
  /** the exported Agent/DO class name (`class WeatherAssistant extends Agent {…}`). */
  className: string;
  /** SQLite-backed storage — REQUIRED by the Agents SDK and the Workers free plan. Default true ⇒ `new_sqlite_classes`. */
  sqlite?: boolean;
  /** cross-script DO: the script that DEFINES the class. Omit for a same-script class (the only kind we migrate). */
  scriptName?: string;
}

export interface DeployInput {
  /** App name (slugified by the provider for resource names). */
  name: string;
  /** The data entities (for the database schema). */
  entities: DeployEntity[];
  /** Path, in the user's project, to the module exporting the Hono `app` (default "./src/app"). */
  appModule?: string;
  /** Built frontend assets directory served as static files (default "./dist/client"). */
  assetsDir?: string;
  /** Worker runtime compatibility date (default DEFAULT_COMPAT_DATE). Pass today's date in production. */
  compatibilityDate?: string;
  /** Emit a PREVIEW deployment variant (charter-bounded role-preview): a `${slug}-preview` Worker with the
   *  two fail-closed locks — a `SULUK_PREVIEW="1"` var + a `PREVIEW_DB` D1 binding on an isolated
   *  `${slug}-preview-db` — plus a seed.sql with one throwaway demo user per role. Prod plans never set these. */
  preview?: boolean;
  /** The roles to seed for a preview deployment (from the contract's User.role enum; cockpit threads them in). */
  previewRoles?: string[];
  /**
   * Durable Object classes to bind + migrate (the Cloudflare Agents SDK runtime surface). When present, the
   * generated wrangler.jsonc gains a `durable_objects.bindings` block and an additive `migrations` entry that
   * creates the SQLite-backed classes. Same-script classes only are migrated; a cross-script class (with
   * `scriptName`) is bound but migrated by its OWNING script. Empty/absent ⇒ no DO output (unchanged plan).
   */
  durableObjects?: DurableObjectBinding[];
  /**
   * The migration tag for the DO classes above (default "v1"). NB the generator emits a FIRST-DEPLOY migration that
   * (re)creates the CURRENT set under this one tag — it has no prev-diff, so bumping the tag alone re-lists every class
   * (a recreate conflict on existing ones). To ADD a class later, hand-append a second entry
   * `{ tag, new_sqlite_classes: [<only the new class>] }`. First-class additive DO evolution is a tracked follow-up.
   */
  durableObjectMigrationTag?: string;
}

/** A file the provider wants written into the project. */
export interface DeployFile {
  path: string;
  content: string;
}

/** One ordered shell step the host (the vscode extension) runs in a terminal AFTER the user authenticates. */
export interface DeployStep {
  cmd: string;
  note: string;
}

export interface DeployPlan {
  provider: string;
  files: DeployFile[];
  steps: DeployStep[];
  /** Human-facing notes (auth, manual fill-ins, caveats). */
  notes: string[];
}

/** A deployment target. Pure: it produces the plan; the host executes the steps (with the user's credentials). */
export interface DeployProvider {
  name: string;
  generate(input: DeployInput): DeployPlan;
}
