/**
 * generateStores — project the C037 reactive facet (`x-suluk-store` + `x-suluk-notify`) into a typed Nano Stores
 * reactive layer ON TOP of the generated SDK client. One self-contained .ts file (the L3 codegen posture of
 * generateSdk — owned source, no @suluk/* runtime dep), implementing the council-verified parity standard (ADR C037):
 *
 *   • POLICY is declared, PLUMBING is emitted, BEHAVIOR is a typed seam.
 *   • STATES  — a query op (`x-suluk-store.key`) becomes a `$<key>` @nanostores/query fetcher store (lazy, cached by
 *     `ttl`, optionally `revalidateOnFocus`); a parameterized query becomes a `(…args) => store` factory.
 *   • EVENTS  — a mutation op (`x-suluk-store.invalidates`) invalidates the named query stores on a 2xx → refetch.
 *   • CALLBACKS — surfaced through an unjs `hookable` hook-bus (ecosystem-parity with ofetch): the DECLARED
 *     `x-suluk-notify` status→severity policy CLASSIFIES + EMITS; the app TAPS `hooks.hook(name, fn)` to render/act.
 *     `onSuccess` text rides the same `notify` hook. The renderer is injected; the policy is declared.
 *
 * What it deliberately does NOT do (parity boundary, ADR §"Parity boundary"): multi-call / zero-call ACTIONS (compose
 * over the generated primitives, or a server aggregate endpoint), optimistic/rollback, retry/cache tuning, derived /
 * normalized state — all BEHAVIOR (a hook/seam) or target-specific adapter config, never the contract.
 *
 * The client accessor names come from the SAME `resolveOps` generateSdk uses, so a store calls EXACTLY the method the
 * SDK emitted (no drift). Generated peer deps: `@nanostores/query`, `nanostores`, `hookable`.
 */
import type { OpenAPIv4Document, SulukNotifyPolicy } from "@suluk/core";
import { resolveOps, clientAccessor, ident, camel, type OpInfo } from "./generate";

export interface StoresOptions {
  /** Import specifier for the generated SDK module (where `SulukClient` lives). Default `"./sdk"`. */
  clientModule?: string;
}

/** The client TYPE index for an op (`["paymentMethods"]["list"]`), matching `clientAccessor`'s runtime path. */
const typeIndex = (op: OpInfo): string =>
  (op.ns.length ? [op.ns[op.ns.length - 1]!, op.member] : [op.member]).map((p) => `["${ident(p!)}"]`).join("");

/** A store/action whose SDK method takes arguments (path params / query / body) → a parameterized factory. */
const argful = (op: OpInfo): boolean => op.pathParams.length > 0 || op.queryRaw != null || op.bodyRaw != null;

export function generateStores(doc: OpenAPIv4Document, opts: StoresOptions = {}): string {
  const { ops } = resolveOps(doc);
  const clientModule = opts.clientModule ?? "./sdk";
  const title = doc.info?.title ?? "API";
  const notify = (doc as { ["x-suluk-notify"]?: SulukNotifyPolicy })["x-suluk-notify"] ?? {};

  const queries = ops.filter((o) => o.store?.key);
  const mutations = ops.filter((o) => o.store?.invalidates && o.store.invalidates.length > 0);

  // ── STATES: a $<key> fetcher store (or a (…args)=>store factory) per query op ──
  const queryDecls = queries
    .map((op) => {
      const key = op.store!.key!;
      const v = "$" + ident(key);
      const acc = clientAccessor(op);
      const T = `Awaited<ReturnType<SulukClient${typeIndex(op)}>>`;
      const settings: string[] = [];
      if (op.store!.ttl != null) settings.push(`cacheLifetime: ${Math.round(op.store!.ttl * 1000)}`);
      if (op.store!.revalidateOnFocus) settings.push(`revalidateOnFocus: true`);
      const setStr = settings.length ? `, ${settings.join(", ")}` : "";
      if (argful(op)) {
        return (
          `  const ${v} = (...args: Parameters<SulukClient${typeIndex(op)}>) =>\n` +
          `    createFetcherStore<${T}>([${JSON.stringify("@" + key)}, JSON.stringify(args)], {\n` +
          `      fetcher: async () => { try { return await client.${acc}(...args); } catch (e) { await emitError(${JSON.stringify(key)}, e); throw e; } }${setStr},\n` +
          `    });`
        );
      }
      return (
        `  const ${v} = createFetcherStore<${T}>([${JSON.stringify("@" + key)}], {\n` +
        `    fetcher: async () => { try { return await client.${acc}(); } catch (e) { await emitError(${JSON.stringify(key)}, e); throw e; } }${setStr},\n` +
        `  });`
      );
    })
    .join("\n");

  // ── invalidators: store key → a function that refetches it (exact `.invalidate()` for plain stores; prefix-match
  //    for parameterized families — @nanostores/query joins key parts with "", so a "@<key>" prefix is unambiguous). ──
  const invalDecls = queries
    .map((op) => {
      const key = op.store!.key!;
      const v = "$" + ident(key);
      const body = argful(op)
        ? `ctx.invalidateKeys((k) => typeof k === "string" && k.startsWith(${JSON.stringify("@" + key)}))`
        : `${v}.invalidate()`;
      return `    ${JSON.stringify(key)}: () => { void hooks.callHook("store:invalidate", { store: ${JSON.stringify(key)} }); ${body}; },`;
    })
    .join("\n");

  // ── EVENTS + CALLBACKS: a wrapped action per mutation op (invalidate named stores on 2xx; surface onSuccess; route
  //    errors through the notify policy; ALWAYS re-throw so callers still catch — the propagation contract). ──
  const actionDecls = mutations
    .map((op) => {
      const name = ident(camel(op.name));
      const acc = clientAccessor(op);
      const inv = op.store!.invalidates!;
      const invCalls = inv.map((k) => `_invalidate[${JSON.stringify(k)}]?.();`).join(" ");
      const successHook = op.store!.onSuccess
        ? `\n      await hooks.callHook("notify", { severity: "success", problem: { status: 200, detail: ${JSON.stringify(op.store!.onSuccess)} } });`
        : "";
      return (
        `  async function ${name}(...args: Parameters<SulukClient${typeIndex(op)}>) {\n` +
        `    try {\n` +
        `      const r = await client.${acc}(...args);\n` +
        `      ${invCalls}\n` +
        `      await hooks.callHook("mutation:success", { op: ${JSON.stringify(name)}, invalidated: ${JSON.stringify(inv)} });${successHook}\n` +
        `      return r;\n` +
        `    } catch (e) {\n` +
        `      await emitError(${JSON.stringify(name)}, e);\n` +
        `      throw e;\n` +
        `    } finally {\n` +
        `      await hooks.callHook("mutation:settled", { op: ${JSON.stringify(name)} });\n` +
        `    }\n` +
        `  }`
      );
    })
    .join("\n");

  const queryNames = queries.map((op) => "$" + ident(op.store!.key!));
  const actionNames = mutations.map((op) => ident(camel(op.name)));
  const ret =
    `  return { ` +
    (queryNames.length ? queryNames.join(", ") + ", " : "") +
    `actions: { ${actionNames.join(", ")} }, hooks, ctx };`;

  return `/**
 * ${title} — reactive Nano Stores layer. AUTO-GENERATED by @suluk/sdk (generateStores) from the v4 contract. Do not edit.
 *
 * Built from the C037 reactive facet: ${queries.length} query store(s), ${mutations.length} mutation action(s). STATES are
 * @nanostores/query fetcher stores; EVENTS are mutation→store invalidations; CALLBACKS surface through an unjs hookable
 * hook-bus (the declared x-suluk-notify policy classifies + emits; YOU tap hooks.hook(name, fn) to render/act). The
 * client accessors match the generated SDK exactly (one resolveOps source). Self-contained: no @suluk/* runtime dep.
 *
 *   import { createClient } from "${clientModule}";
 *   import { createStores } from "./stores";
 *   import { toast } from "sonner";
 *   const api = createClient({ baseURL: "…" });
 *   const stores = createStores(api);
 *   stores.hooks.hook("notify", ({ severity, problem }) => severity !== "silent" && toast[severity](problem.detail ?? problem.title ?? "Error"));
 *   // component:  const { data } = useStore(stores.$paymentMethods);   action:  await stores.actions.setDefaultPaymentMethod({ id });
 *
 * Requires: \`npm i @nanostores/query nanostores hookable\`.
 */
import { nanoquery } from "@nanostores/query";
import { createHooks, type Hookable } from "hookable";
import type { SulukClient } from "${clientModule}";

/** How loudly a response surfaces (the x-suluk-notify severities). */
export type NotifySeverity = "silent" | "info" | "success" | "warn" | "error";
/** An RFC-9457-ish problem surfaced to hooks (the parsed error body + its status). */
export interface StoreProblem {
  status: number | "network";
  title?: string;
  detail?: string;
  raw?: unknown;
}

/** The typed hook bus (unjs hookable). Tap these to render/act — the BEHAVIOR seam (the contract declares POLICY only). */
export interface StoreHooks {
  /** the policy decided this response should surface — render it (e.g. a toast). */
  notify: (e: { severity: NotifySeverity; problem: StoreProblem }) => void | Promise<void>;
  /** a query/action errored (fires for EVERY error, even silent ones — for logging). */
  "request:error": (e: { op: string; severity: NotifySeverity; problem: StoreProblem }) => void | Promise<void>;
  /** a mutation action succeeded (2xx) and invalidated its stores. */
  "mutation:success": (e: { op: string; invalidated: string[] }) => void | Promise<void>;
  /** a mutation action settled (success or error). */
  "mutation:settled": (e: { op: string }) => void | Promise<void>;
  /** a query store was invalidated (about to refetch). */
  "store:invalidate": (e: { store: string }) => void | Promise<void>;
}

/** The DECLARED status→severity policy (x-suluk-notify). Keys: a status ("402"), a class ("2xx"/"4xx"/"5xx"), or "network". */
const NOTIFY: Record<string, NotifySeverity> = ${JSON.stringify(notify)};

/** Classify a status to a severity: exact status > class (Nxx) > "network" > "silent". */
function classify(status: number | "network"): NotifySeverity {
  const k = String(status);
  if (NOTIFY[k]) return NOTIFY[k]!;
  if (typeof status === "number") {
    const cls = Math.floor(status / 100) + "xx";
    if (NOTIFY[cls]) return NOTIFY[cls]!;
  }
  if (status === "network" && NOTIFY["network"]) return NOTIFY["network"]!;
  return "silent";
}

/** Extract an RFC-9457 problem from an ofetch error (status + parsed body). */
function problemOf(e: unknown): StoreProblem {
  const err = (e ?? {}) as { status?: number; statusCode?: number; response?: { status?: number; _data?: unknown }; data?: { title?: string; detail?: string } };
  const raw = (err.response?.status ?? err.status ?? err.statusCode);
  const status: number | "network" = typeof raw === "number" ? raw : "network";
  const data = (err.data ?? (err.response?._data as { title?: string; detail?: string } | undefined)) ?? undefined;
  return { status, title: data?.title, detail: data?.detail ?? (e instanceof Error ? e.message : undefined), raw: data };
}

export interface CreateStoresOptions {
  /** Bring your own hook bus (e.g. to share one across modules). Defaults to a fresh \`createHooks<StoreHooks>()\`. */
  hooks?: Hookable<StoreHooks>;
}

/** Create the reactive store layer for ${title}, bound to an SDK client. The contract declares the policy; you inject the rendering via \`hooks\`. */
export function createStores(client: SulukClient, options: CreateStoresOptions = {}) {
  const hooks = options.hooks ?? createHooks<StoreHooks>();
  const [createFetcherStore, , ctx] = nanoquery();

  /** classify → fire request:error (always) → fire notify (unless silent). The single error seam. */
  async function emitError(op: string, e: unknown): Promise<void> {
    const problem = problemOf(e);
    const severity = classify(problem.status);
    await hooks.callHook("request:error", { op, severity, problem });
    if (severity !== "silent") await hooks.callHook("notify", { severity, problem });
  }

${queryDecls || "  // (no query stores declared)"}

  const _invalidate: Record<string, () => void> = {
${invalDecls}
  };

${actionDecls || "  // (no mutation actions declared)"}

${ret}
}

/** The reactive store layer's shape (stores + actions + hooks + the @nanostores/query ctx). */
export type SulukStores = ReturnType<typeof createStores>;
`;
}
