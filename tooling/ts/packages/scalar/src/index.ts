/**
 * `@suluk/scalar` — render an OpenAPI v4 "Suluk" document with Scalar API Reference, taught to show v4.
 *
 * Scalar's engine is OpenAPI 3.x-shaped, so we project the v4 doc down to 3.1 (via @suluk/openapi-compat) and feed
 * it to the Scalar standalone bundle. But a plain downgrade DROPS the v4-native facets — so this package is the
 * first phase of "Scalar-for-v4": it (1) PINS Scalar (we own the version — no `@latest` drift), and (2) surfaces
 * the v4 facets Scalar can't natively read — `x-suluk-cost` + `x-suluk-access` become Scalar `x-badges` rendered
 * right on each operation — plus a suluk theme. Deeper, native v4 (request-name identity, parameterSchema panels,
 * multi-request-per-method) is the source-fork track documented in FORK.md. CANDIDATE tooling.
 *
 * NATIVE v4 OUT OF THE BOX (v0.8.0): `scalarV4Response` now defaults `cdn` to the published fork bundle
 * (`@suluk/scalar-standalone` on jsdelivr-npm, `SULUK_FORK_CDN`) — vanilla Scalar can't project v4
 * `requests`→operations, so the old vanilla default silently rendered only Models. Override `cdn` to self-host.
 */
import { downgrade, type Diagnostic } from "@suluk/openapi-compat";
import type { OpenAPIv4Document } from "@suluk/core";
import { auditDocument, type OpAudit } from "@suluk/harden";

/** We OWN this version (the fork's first act): pin instead of riding `@latest`, so the UI never drifts under us. */
export const SCALAR_VERSION = "1.59.0";
const DEFAULT_CDN = `https://cdn.jsdelivr.net/npm/@scalar/api-reference@${SCALAR_VERSION}`;

/**
 * The PINNED suluk-forked Scalar standalone (Scalar + the v4 patch-set), published as `@suluk/scalar-standalone` and
 * served from jsdelivr-npm. This is what makes the native-v4 view (`scalarV4Response`) work OUT OF THE BOX: vanilla
 * Scalar can't project v4 `requests`→operations, so a consumer who left `cdn` defaulted to `DEFAULT_CDN` (vanilla)
 * saw only Models. `scalarV4Html` now defaults to THIS fork instead. Override `opts.cdn` to self-host the bytes
 * (e.g. local-first: serve the bundle from your own origin) — the previous behaviour for those who want no CDN.
 */
export const SULUK_FORK_STANDALONE_VERSION = "0.1.0";
export const SULUK_FORK_CDN = `https://cdn.jsdelivr.net/npm/@suluk/scalar-standalone@${SULUK_FORK_STANDALONE_VERSION}/dist/standalone-suluk.js`;

export interface ScalarOptions {
  /** Browser tab title. */
  pageTitle?: string;
  /** CDN URL for the Scalar standalone bundle (override for pinning/self-hosting). */
  cdn?: string;
  /** Surface v4 facets (cost + access) as Scalar badges on each operation (default true). */
  facetBadges?: boolean;
  /** Append a native collapsible `<details>` input-hardening report (grade + findings, from @suluk/harden) to each
   *  operation's description (default true). Set false to skip the audit + keep descriptions clean. */
  hardening?: boolean;
  /** Override the injected suluk theme CSS. */
  customCss?: string;
  /** Extra Scalar configuration merged into createApiReference (theme, layout, hideModels, …). */
  configuration?: Record<string, unknown>;
}

export interface RenderResult {
  /** A complete, self-contained HTML document. */
  html: string;
  /** Lossy-conversion diagnostics from the v4→3.1 downgrade (e.g. method collisions). */
  diagnostics: Diagnostic[];
}

const HTTP_METHODS = ["get", "put", "post", "patch", "delete", "head", "options", "trace"] as const;

/** A small accent of suluk's identity over Scalar's own design tokens (kept light — Scalar's UI is already good). The
 *  cost facet mirrors @suluk/cost's CostModel — the FULL route economics, not just a flat number. */
interface CostComponent { source?: string; basis?: string; microUsd?: number; description?: string }
interface CostSettlement { method?: "credit" | "rate-limited" | "free" | "subscription" | "trust" | "lead"; credits?: number; overflow?: "deny" | "credit" }
interface CostFacet {
  estimateMicroUsd?: number;
  components?: CostComponent[];
  /** HOW the operator RECOVERS the cost (C044): credit · rate-limited · free. */
  settlement?: CostSettlement;
  /** WHEN the cost fires (C024): synchronous (default) · webhook-received · scheduled · queue-consumed · callback-completed. */
  trigger?: string;
  /** the by-name op whose firing accrues this cost (a non-sync trigger). */
  triggerRef?: string;
  /** WHO pays a background cost (session · event-expression · job-stamped). */
  attribution?: { strategy?: string; expression?: string; trust?: string };
}
interface AccessFacet { requires?: "anyone" | "authenticated" | "admin"; scope?: "owner" }

// `per-call` = a FIXED cost each request; every other basis is VARIABLE/metered — DYNAMIC cost whose amount is only known
// at runtime (from tokens, file MB, compute seconds, upstream calls, …). The static declaration names the RATE + the unit.
const isFixed = (c: CostComponent): boolean => (c.basis ?? "per-call") === "per-call";
const BASIS_LABEL: Record<string, string> = { "per-call": "call", "per-unit": "unit", "per-token": "token", "per-1k-tokens": "1k tokens", "per-second": "second", "per-request": "upstream call", "per-mb": "MB" };
const SETTLE_LABEL: Record<string, string> = { credit: "💳 credits", "rate-limited": "⏳ rate-limited", free: "🎁 free", subscription: "🔁 subscription", trust: "🤝 net-terms", lead: "🎯 lead" };
// user-pays methods (credit debits now, subscription bills via the plan, trust post-pays) render as PAID (purple); the
// operator-absorbed methods (free, lead-gen) render green; rate-limited (free within a cap) renders orange. A future method
// defaults to the paid color, never green — so an unmapped method never reads as "free to the user".
const SETTLE_COLOR: Record<string, string> = { credit: "var(--scalar-color-purple)", subscription: "var(--scalar-color-purple)", trust: "var(--scalar-color-purple)", "rate-limited": "var(--scalar-color-orange)", free: "var(--scalar-color-green)", lead: "var(--scalar-color-green)" };

/** The FIXED per-call total (µ$): the declared estimate if given, else the sum of the per-call components. VARIABLE
 *  (metered) components are excluded — their amount is reported at runtime, so the badge/estimate shows the floor. */
function costTotal(cost: CostFacet): number {
  return cost.estimateMicroUsd ?? (cost.components ?? []).filter(isFixed).reduce((s, c) => s + (c.microUsd ?? 0), 0);
}
const hasVariable = (cost: CostFacet): boolean => (cost.components ?? []).some((c) => !isFixed(c) && (c.microUsd ?? 0) > 0);
const fmtCost = (micro: number): string => (micro >= 10000 ? "$" + (micro / 1_000_000).toFixed(4) : micro + "µ$");
const accessText = (acc: AccessFacet): string =>
  ({ admin: "Admin only", authenticated: "Signed-in users", anyone: "Public (no auth)" }[acc.requires ?? "anyone"] ?? "Public") + (acc.scope === "owner" ? " · owner-scoped (you only see your own rows)" : "");

function costBadge(cost: CostFacet | undefined): { name: string; color: string } | null {
  if (!cost) return null;
  const total = costTotal(cost);
  const variable = hasVariable(cost);
  if (!total && !variable) return null;
  // `＋` marks a DYNAMIC cost on top of the fixed floor (metered by tokens/MB/…); a purely-metered op reads "💰 metered".
  const name = total ? `💰 ${fmtCost(total)}${variable ? "＋" : ""}` : "💰 metered";
  // Colours are Scalar theme tokens (not hardcoded hex), so the badge adapts to whatever Scalar theme is active
  // and renders in the fork's subtle semantic style (faint tint + coloured text), matching Scalar's own badges.
  return { name, color: "var(--scalar-color-purple)" };
}

/** How the cost is SETTLED (C044) as its own badge, so the payment model reads at a glance alongside cost + access. */
function settlementBadge(cost: CostFacet | undefined): { name: string; color: string } | null {
  const m = cost?.settlement?.method;
  if (!m) return null;
  const color = SETTLE_COLOR[m] ?? "var(--scalar-color-purple)"; // default paid, never green — an unmapped method must not read as free
  return { name: SETTLE_LABEL[m] ?? m, color };
}

/** An INTERNAL op (x-suluk-internal) badge — the op is documented + grouped under "Internal" but NOT reachable over the
 *  wire (the contract's enforceInternal guard 404s it in dev/live); it runs only via @suluk/hono's internalFetch in tests. */
function internalBadge(op: Record<string, unknown>): { name: string; color: string } | null {
  return op["x-suluk-internal"] === true ? { name: "🔒 Internal", color: "var(--scalar-color-red)" } : null;
}

function accessBadge(acc: AccessFacet | undefined): { name: string; color: string } | null {
  if (!acc?.requires) return null; // only badge when the access facet is actually declared on the op
  const m = { admin: { n: "🔒 Admin", c: "var(--scalar-color-red)" }, authenticated: { n: "👤 Signed-in", c: "var(--scalar-color-orange)" }, anyone: { n: "🌐 Public", c: "var(--scalar-color-green)" } }[acc.requires];
  if (!m) return null;
  return { name: m.n + (acc.scope === "owner" ? " · owner" : ""), color: m.c };
}

/** Mutate a downgraded 3.1 spec: attach Scalar `x-badges` derived from the carried-through v4 facets, so cost +
 *  access show up right on each operation in Scalar's UI (which has no native concept of them). */
export function enrichFacetBadges(spec: { paths?: Record<string, Record<string, unknown>> }): void {
  for (const pi of Object.values(spec.paths ?? {})) {
    if (!pi || typeof pi !== "object") continue;
    for (const m of HTTP_METHODS) {
      const op = pi[m] as Record<string, unknown> | undefined;
      if (!op || typeof op !== "object") continue;
      const badges: { name: string; position: "after"; color: string }[] = [];
      const ab = accessBadge(op["x-suluk-access"] as AccessFacet | undefined); if (ab) badges.push({ position: "after", ...ab });
      const cb = costBadge(op["x-suluk-cost"] as CostFacet | undefined); if (cb) badges.push({ position: "after", ...cb });
      const sb = settlementBadge(op["x-suluk-cost"] as CostFacet | undefined); if (sb) badges.push({ position: "after", ...sb });
      const ib = internalBadge(op); if (ib) badges.push({ position: "after", ...ib });
      if (badges.length) op["x-badges"] = badges;
    }
  }
}

/** One cost-bearing event another op fires when THIS route runs (the reverse of `x-suluk-cost.triggerRef`). */
interface TriggeredCost { name: string; trigger: string; total: number }

/** Reverse index of `x-suluk-cost.triggerRef`: op NAME → the cost-bearing EVENTS (other ops) whose cost accrues when
 *  this op fires. So each route can show the downstream events it triggers + their per-event cost. Built off the v4
 *  `requests` (by name) — the one place the whole doc is in view. */
function triggerIndex(paths: Record<string, { requests?: Record<string, Record<string, unknown>> }> | undefined): Map<string, TriggeredCost[]> {
  const idx = new Map<string, TriggeredCost[]>();
  for (const pi of Object.values(paths ?? {})) {
    for (const [name, req] of Object.entries(pi?.requests ?? {})) {
      const cost = (req as Record<string, unknown>)?.["x-suluk-cost"] as CostFacet | undefined;
      if (cost?.trigger && cost.trigger !== "synchronous" && cost.triggerRef) {
        (idx.get(cost.triggerRef) ?? idx.set(cost.triggerRef, []).get(cost.triggerRef)!).push({ name, trigger: cost.trigger, total: costTotal(cost) });
      }
    }
  }
  return idx;
}

/** The full v4-facet detail for an operation, as a markdown block appended to its description — so EXPANDING an operation
 *  in Scalar reveals the ROUTE ECONOMICS: access · cost (the fixed floor + each DYNAMIC/metered component with its rate +
 *  unit) · how it's SETTLED (credit/rate-limited/free) · when its cost ACCRUES (a non-sync trigger + who pays) · and the
 *  downstream cost-bearing EVENTS it triggers — not just the collapsed badge. `triggered` = this op's reverse-index entry. */
function facetDetail(op: Record<string, unknown>, triggered?: TriggeredCost[]): string {
  const lines: string[] = [];
  const acc = op["x-suluk-access"] as AccessFacet | undefined;
  if (acc?.requires) lines.push(`**Access** — ${accessText(acc)}`);
  const cost = op["x-suluk-cost"] as CostFacet | undefined;
  if (cost) {
    // the FIXED floor + its per-call breakdown.
    const total = costTotal(cost);
    const fixed = (cost.components ?? []).filter((c) => isFixed(c) && c.microUsd).map((c) => `${c.source ?? "?"} ${c.microUsd}µ$`).join(" · ");
    lines.push(`**Cost** — ~${fmtCost(total)} per call${fixed ? ` _(${fixed})_` : ""}`);
    // the DYNAMIC / metered components — cost that scales with tokens / file MB / compute seconds / upstream calls, etc.
    for (const c of (cost.components ?? []).filter((c) => !isFixed(c) && c.microUsd)) {
      lines.push(`&nbsp;&nbsp;↳ **+ ${c.microUsd}µ$ / ${BASIS_LABEL[c.basis ?? ""] ?? c.basis}** — ${c.source ?? "?"}${c.description ? ` _(${c.description})_` : ""}`);
    }
    // SETTLEMENT — how the user pays for it.
    const s = cost.settlement;
    if (s?.method) {
      const how = s.method === "credit"
        ? (s.credits != null ? `${s.credits} credit${s.credits === 1 ? "" : "s"} debited per call` : "credits debited (amount derived from the estimate)")
        : s.method === "rate-limited"
          ? `free within the rate-limit cap${s.overflow === "credit" ? ", then credits" : ""}`
        : s.method === "subscription"
          ? "recovered against the user's plan allowance (no per-call debit)"
        : s.method === "trust"
          ? "accrued now, settled later (post-pay / net-terms)"
        : s.method === "lead"
          ? "an acquisition investment — the operator absorbs the cost"
          : "the operator absorbs the cost"; // free
      lines.push(`**Settlement** — ${SETTLE_LABEL[s.method] ?? s.method} · ${how}`);
    }
    // this op's OWN cost fires on an EVENT (non-synchronous) — when it accrues + who pays.
    if (cost.trigger && cost.trigger !== "synchronous") {
      lines.push(`**Accrues** — on \`${cost.trigger}\`${cost.triggerRef ? ` (via \`${cost.triggerRef}\`)` : ""}${cost.attribution?.strategy ? ` · billed to _${cost.attribution.strategy}_` : ""}`);
    }
  }
  // the downstream cost-bearing EVENTS this route triggers (the reverse of triggerRef).
  if (triggered?.length) {
    lines.push(`**Triggers** — ${triggered.map((t) => `\`${t.name}\` _(${t.trigger}${t.total ? `, ~${fmtCost(t.total)}` : ""})_`).join(" · ")}`);
  }
  return lines.length ? `\n\n---\n\n${lines.join("  \n")}` : "";
}

const SEV_ICON: Record<string, string> = { high: "🔴", medium: "🟠", low: "🟡" };

/** A NATIVE COLLAPSIBLE input-hardening report for ONE operation — its @suluk/harden grade + score + each finding
 *  (severity · schema path · what's wrong · the fix) — as an HTML `<details>` appended to the op's description, so every
 *  route carries its own hardening audit inline in the Scalar UI (collapsed by default; expand to see the findings).
 *  Rendered as HTML (not markdown) so the disclosure + list render regardless of the description's markdown processor. */
function hardeningDetail(audit: OpAudit | undefined): string {
  if (!audit) return "";
  const n = audit.findings.length;
  const summary = `🛡 Hardening — grade ${audit.grade} · ${audit.score}/100 · ${n === 0 ? "no findings" : `${n} finding${n === 1 ? "" : "s"}`}`;
  const body =
    n === 0
      ? `<p>Every input schema on this operation is typed and bounded — nothing malformed or oversized gets through.</p>`
      : `<ul>${audit.findings
          .map((f) => `<li>${SEV_ICON[f.severity] ?? "•"} <strong>${escapeHtml(f.severity)}</strong> <code>${escapeHtml(f.path)}</code> — ${escapeHtml(f.message)} <em>(fix: ${escapeHtml(f.fix)})</em></li>`)
          .join("")}</ul>`;
  return `\n\n<details><summary>${escapeHtml(summary)}</summary>${body}</details>`;
}

/** Append the v4 facet detail to each operation's description (progressive disclosure, complementing the badges). `tIdx`
 *  (the reverse trigger index, keyed by op NAME = the 3.1 `operationId`) drives the "Triggers" line — pass it from the
 *  original v4 doc (the downgraded spec has no `requests` to build it from). */
export function enrichFacetDetail(spec: { paths?: Record<string, Record<string, unknown>> }, tIdx?: Map<string, TriggeredCost[]>): void {
  for (const pi of Object.values(spec.paths ?? {})) {
    if (!pi || typeof pi !== "object") continue;
    for (const m of HTTP_METHODS) {
      const op = pi[m] as Record<string, unknown> | undefined;
      if (!op || typeof op !== "object") continue;
      const detail = facetDetail(op, tIdx?.get(op.operationId as string));
      if (detail) op.description = (typeof op.description === "string" ? op.description : "") + detail;
    }
  }
}

/** Prepend a short "this is a Suluk v4 contract" note (+ a cost-coverage tally) to the doc intro Scalar shows up top. */
export function v4Intro(spec: { info?: Record<string, unknown>; paths?: Record<string, Record<string, unknown>> }): void {
  let total = 0, priced = 0;
  for (const pi of Object.values(spec.paths ?? {})) {
    for (const m of HTTP_METHODS) {
      const op = pi?.[m] as Record<string, unknown> | undefined;
      if (!op || typeof op !== "object") continue;
      total++;
      if (op["x-suluk-cost"]) priced++;
    }
  }
  if (!total) return;
  const note = `> **Suluk v4 contract.** Every operation is **cost-metered** (micro-USD) and **access-scoped** — the badges show each op's access + per-call cost, and expanding an operation reveals the cost breakdown by source. ${priced} of ${total} operations carry a declared cost.`;
  const info = (spec.info ??= {});
  info.description = note + (typeof info.description === "string" && info.description ? `\n\n${info.description}` : "");
}

/** Embed a spec object safely inside a <script> by neutralizing `<` (prevents `</script>` breakout). */
function embed(spec: unknown): string {
  return JSON.stringify(spec).replace(/</g, "\\u003c");
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/** Project a v4 document to the 3.1 spec Scalar consumes, ENRICHED with the v4 facets (cost/access → badges + detail
 *  + intro). The standalone (+ the /reference composite's view-as endpoint) both serve this. Never mutates `doc`. */
export function enrichedSpec(doc: OpenAPIv4Document, opts: { facetBadges?: boolean; hardening?: boolean } = {}): { spec: Record<string, unknown>; diagnostics: Diagnostic[] } {
  const { document: raw, diagnostics } = downgrade(doc);
  // Clone before enriching: `downgrade` shares sub-objects (info/operations) with the input by reference, so mutating
  // them in place would corrupt the caller's document (and accumulate across calls). The spec is JSON-safe.
  const spec = JSON.parse(JSON.stringify(raw));
  if (opts.facetBadges !== false) {
    enrichFacetBadges(spec);
    // the reverse trigger index is built off the ORIGINAL v4 doc (`requests` by name) — the downgraded spec has none.
    enrichFacetDetail(spec, triggerIndex(doc.paths as unknown as Parameters<typeof triggerIndex>[0]));
    v4Intro(spec);
    // the per-op hardening report — audit the ORIGINAL v4 doc (it reads `requests`), map by method+path onto the
    // downgraded ops, and append the collapsible `<details>` to each op's description.
    if (opts.hardening !== false) enrichHardening3x(spec, doc);
  }
  return { spec, diagnostics };
}

/** Append the per-op hardening `<details>` to a DOWNGRADED 3.1 spec — mapping @suluk/harden's audit of the original v4
 *  `doc` onto the 3.1 ops by `${method} ${path}` (the v4→3.1 downgrade preserves path+method for the 1-request case). */
function enrichHardening3x(spec: { paths?: Record<string, Record<string, unknown>> }, doc: OpenAPIv4Document): void {
  // key by method + path, normalizing the leading slash (the v4→3.1 downgrade prefixes `/` on bare path keys).
  const norm = (p: string) => p.replace(/^\//, "");
  const byPM = new Map(auditDocument(doc).byOperation.map((o) => [`${o.method} ${norm(o.path)}`, o]));
  for (const [uri, pi] of Object.entries(spec.paths ?? {})) {
    if (!pi || typeof pi !== "object") continue;
    for (const m of HTTP_METHODS) {
      const op = pi[m] as Record<string, unknown> | undefined;
      if (!op || typeof op !== "object") continue;
      const detail = hardeningDetail(byPM.get(`${m} ${norm(uri)}`));
      if (detail) op.description = (typeof op.description === "string" ? op.description : "") + detail;
    }
  }
}

/** Mutate a v4 document: stamp the facet badges + detail on each REQUEST (the v4 by-name operation) and prepend the
 *  v4-contract intro — the same superpowers as the 3.1 path, but kept in v4 shape. The forked Scalar ingests this
 *  natively (projects requests→ops internally) and carries `x-badges` / `x-suluk-*` through, so cost + access render
 *  on each operation AND the version badge reads 4.0.0-candidate (no downgrade). Reuses the 3.1 badge helpers since a
 *  v4 request carries `x-suluk-cost` / `x-suluk-access` directly. */
export function enrichV4Facets(doc: { paths?: Record<string, { requests?: Record<string, Record<string, unknown>> }>; info?: Record<string, unknown> }, opts: { hardening?: boolean } = {}): void {
  // the per-op input-hardening audit (@suluk/harden), keyed by the v4 request NAME — appended as a collapsible per route.
  const audit = opts.hardening === false ? null : auditDocument(doc as unknown as OpenAPIv4Document);
  const hardenByName = audit ? new Map(audit.byOperation.map((o) => [o.operation, o])) : null;
  // the reverse trigger index: op NAME → the cost-bearing events it triggers (drives the "Triggers" detail line).
  const tIdx = triggerIndex(doc.paths);
  let total = 0, priced = 0;
  for (const pi of Object.values(doc.paths ?? {})) {
    for (const [name, req] of Object.entries(pi?.requests ?? {})) {
      if (!req || typeof req !== "object") continue;
      total++;
      if (req["x-suluk-cost"]) priced++;
      const badges: { name: string; position: "after"; color: string }[] = [];
      const ab = accessBadge(req["x-suluk-access"] as AccessFacet | undefined); if (ab) badges.push({ position: "after", ...ab });
      const cb = costBadge(req["x-suluk-cost"] as CostFacet | undefined); if (cb) badges.push({ position: "after", ...cb });
      const sb = settlementBadge(req["x-suluk-cost"] as CostFacet | undefined); if (sb) badges.push({ position: "after", ...sb });
      const ib = internalBadge(req); if (ib) badges.push({ position: "after", ...ib });
      if (badges.length) req["x-badges"] = badges;
      const detail = facetDetail(req, tIdx.get(name)) + (hardenByName ? hardeningDetail(hardenByName.get(name)) : "");
      if (detail) req.description = (typeof req.description === "string" ? req.description : "") + detail;
    }
  }
  if (!total) return;
  const hardenNote = audit ? ` The input-hardening grade is **${audit.grade}** (${audit.score}/100) — expand any operation for its per-route hardening report.` : "";
  const note = `> **Suluk v4 contract.** Every operation is **cost-metered** (micro-USD) and **access-scoped** — the badges show each op's access + per-call cost, and expanding an operation reveals the cost breakdown by source.${hardenNote} ${priced} of ${total} operations carry a declared cost.`;
  const info = (doc.info ??= {});
  info.description = note + (typeof info.description === "string" && info.description ? `\n\n${info.description}` : "");
}

/** Enrich a v4 document with the suluk facets (badges + detail + intro) WITHOUT downgrading — for the forked Scalar
 *  that ingests v4 NATIVELY. Never mutates `doc` (JSON-clone first). The output is fed to Scalar's `content` as-is. */
export function enrichedV4(doc: OpenAPIv4Document, opts: { facetBadges?: boolean; hardening?: boolean } = {}): { spec: Record<string, unknown> } {
  const spec = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
  if (opts.facetBadges !== false) enrichV4Facets(spec as Parameters<typeof enrichV4Facets>[0], opts);
  return { spec };
}

/** Render a v4 document to a self-contained Scalar HTML page (+ downgrade diagnostics). */
export function scalarHtml(doc: OpenAPIv4Document, opts: ScalarOptions = {}): RenderResult {
  const { spec, diagnostics } = enrichedSpec(doc, opts);
  const title = escapeHtml(opts.pageTitle ?? doc.info?.title ?? "API Reference");
  const cdn = opts.cdn ?? DEFAULT_CDN;
  const config = embed({ content: spec, customCss: opts.customCss ?? "", ...(opts.configuration ?? {}) });
  const html = `<!doctype html>
<html>
  <head>
    <title>${title}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/icon-32.png" />
  </head>
  <body>
    <div id="app"></div>
    <script src="${cdn}"></script>
    <script>
      Scalar.createApiReference('#app', ${config})
    </script>
  </body>
</html>`;
  return { html, diagnostics };
}

/** Convenience for Bun.serve / Hono / fetch handlers: the Scalar page as a text/html Response. */
export function scalarResponse(doc: OpenAPIv4Document, opts: ScalarOptions = {}): Response {
  return new Response(scalarHtml(doc, opts).html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

export interface ScalarV4Options extends ScalarOptions {
  /** Brand shown in the suluk toolbar. */
  brand?: string;
  /** Endpoint returning the ENRICHED 3.1 spec (see `enrichedSpec`); the view selector appends `?<param>=<value>` and
   *  re-mounts Scalar with the result — a real per-role v4 projection driving Scalar's UI. */
  specUrl?: string;
  specParam?: string;
  /** Role/view projections offered in the toolbar (e.g. Anonymous / Signed-in / Admin). */
  views?: { label: string; value: string }[];
  /** URL of the embeddable v4 SUPERPOWERS panels (e.g. @suluk/reference's `referenceInsightsHtml`) — opened as an
   *  in-page slide-in DRAWER (no second dashboard). The current "View as" role is passed via the same `specParam`. */
  insightsUrl?: string;
  insightsLabel?: string;
  /** (legacy) link out to a separate renderer instead of the in-page drawer. Prefer `insightsUrl`. */
  nativeUrl?: string;
  nativeLabel?: string;
}

/** Embed a value safely inside an inline <script>: JSON-encode + neutralize `</script>` / `<!--`. */
function jsConst(v: unknown): string { return JSON.stringify(v).replace(/</g, "\\u003c"); }

/**
 * The saasuluk-grade **v4 reference**: the self-hosted Scalar UI fed the v4 doc (faithful + facet-enriched), wrapped
 * in a suluk toolbar that adds the v4-native "View as" ROLE projector (Anonymous / Signed-in / Admin) — picking a
 * role re-mounts Scalar with that role's projected spec from `specUrl` — and a link out to the deep native renderer.
 */
export function scalarV4Html(doc: OpenAPIv4Document, opts: ScalarV4Options = {}): RenderResult {
  // NATIVE v4: feed Scalar the enriched v4 doc (not the 3.1 downgrade). The forked standalone ingests it natively —
  // projects requests→ops internally + shows the 4.0.0-candidate version badge. (The downgrade still backs /scalar.)
  const { spec } = enrichedV4(doc, opts);
  const diagnostics: Diagnostic[] = [];
  const title = escapeHtml(opts.pageTitle ?? doc.info?.title ?? "API Reference");
  // Native v4 REQUIRES the forked standalone (vanilla Scalar renders only Models). Default to the published fork on
  // jsdelivr-npm so this works out of the box; a consumer can override `cdn` to self-host the bytes from their origin.
  const cdn = opts.cdn ?? SULUK_FORK_CDN;
  // showOperationId surfaces each operation's operationId — which IS the v4 request NAME (the by-name identity v4
  // keys operations on) — as a badge in Scalar's own operation header. Default ON for the v4 reference; overridable.
  // customCss defaults to NOTHING so the user's chosen Scalar theme drives every colour (we never override the accent).
  const cfg = { customCss: opts.customCss ?? "", showOperationId: true, ...(opts.configuration ?? {}) };
  const specParam = opts.specParam ?? "as";
  // The "View as" projector lives in Scalar's OWN sidebar (the fork renders it from x-suluk-views), not a custom bar.
  const views = (opts.specUrl && (opts.views ?? []).length) ? (opts.views ?? []) : [];

  const html = `<!doctype html>
<html>
  <head>
    <title>${title}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/favicon.svg" />
  </head>
  <body>
    <div id="app"></div>
    <script src="${cdn}"></script>
    <script>
      var CFG = ${jsConst(cfg)}, INITIAL = ${jsConst(spec)}, SPEC_URL = ${jsConst(opts.specUrl ?? "")}, AS = ${jsConst(specParam)}, INS_URL = ${jsConst(opts.insightsUrl ?? "")}, VIEWS = ${jsConst(views)}, curRole = "";
      // The forked Scalar renders, in its OWN chrome: the v4 facet panels + ⚡ insights (content-start slot, from
      // x-suluk-insights) and the "View as" role projector (sidebar-start slot, from x-suluk-views). Picking a role
      // dispatches a 'suluk:viewas' DOM event we catch here to re-fetch + re-mount with that role's projected spec.
      function insUrl(){ return INS_URL ? (INS_URL + (curRole ? ('?'+AS+'='+encodeURIComponent(curRole)) : '')) : ''; }
      function mount(spec){ var a=document.getElementById('app'); a.innerHTML=''; var o={}; for(var k in CFG)o[k]=CFG[k]; o.content=spec; var iu=insUrl(); if(iu)o['x-suluk-insights']=iu; if(VIEWS&&VIEWS.length){o['x-suluk-views']=VIEWS;o['x-suluk-view']=curRole;} Scalar.createApiReference('#app', o); }
      mount(INITIAL);
      if(SPEC_URL && VIEWS && VIEWS.length){
        document.addEventListener('suluk:viewas', function(ev){ var v=ev.detail||''; curRole=v;
          if(!v){ mount(INITIAL); return; }
          fetch(SPEC_URL+'?'+AS+'='+encodeURIComponent(v),{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(s){ mount(s); }).catch(function(){ mount(INITIAL); });
        });
      }
    </script>
  </body>
</html>`;
  return { html, diagnostics };
}

/** The v4 Scalar reference as a text/html Response. */
export function scalarV4Response(doc: OpenAPIv4Document, opts: ScalarV4Options = {}): Response {
  return new Response(scalarV4Html(doc, opts).html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
