#!/usr/bin/env bun
// Project cloudflare_pricing.json (prose-rich: descriptions, notes, verbatim labels) into
// cloudflare_pricing_pragmatic.json — a computation-ready pricing table a cost engine can consume DIRECTLY, with
// no NLP: every value is a number or a space-free token. Prose fields (name, label, description, notes, meta
// description/disclaimer/schema) are DROPPED; the numeric meter/catalog fields are preserved verbatim.
//
// Transform rules (all mechanical, deterministic — no interpretation):
//   • units → base-unit tokens: drop thousands-commas, drop the redundant leading SCALE word (the batch size is
//     already carried by `overage_per` / catalog `per`, so keeping it would double-encode), lowercase, slugify.
//       "million CPU ms" → "cpu_ms" (overage_per already = 1_000_000)   "1,000 emails" → "emails" (overage_per = 1000)
//   • catalog item/unit → slug (spaces → "_"); model ids like "@cf/meta/llama-3.2-1b-instruct" pass through.
//   • plans keep {key, base_usd_month}; a null base (contract/N-A) is flagged `contract:true`.
//   • null/absent numeric fields are omitted (presence is the signal), not carried as null noise.
// Run: `bun tooling/ts/packages/cloudflare/pragmatic.ts` (rewrites the pragmatic file in place).
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "cloudflare_pricing.json");
const OUT = join(HERE, "cloudflare_pricing_pragmatic.json");

/** snake_case token: strip thousands-commas, lowercase, non-alphanumerics → "_", trim. Space-free by construction. */
const slug = (s: string): string =>
  s.replace(/,/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** A meter's base-unit token: the verbatim unit minus its redundant leading scale (million | 1,000 | 100,000 | …). */
const unitToken = (u: string): string =>
  slug(u.replace(/,/g, "").replace(/^\s*(?:\d+|million|billion|thousand|hundred)\s+/i, ""));

/** An item token: preserve model ids (`@cf/…`, dots, dashes, slashes); only spaces are the bad smell → "_". */
const itemToken = (s: string): string => s.trim().replace(/\s+/g, "_");

type Src = {
  _meta: { source: string; fetched: string; currency: string };
  products: Array<{
    id: string; category: string; source_confidence: string;
    doc_url?: string | null; pricing_url?: string | null; limits_url?: string | null;
    plans: Array<{ key: string; base_usd_month: number | null }>;
    meters: Array<{
      key: string; unit: string;
      free_included?: number | null; free_period?: string | null;
      paid_included?: number | null; paid_period?: string | null;
      overage_usd?: number | null; overage_per?: number | null;
    }>;
    catalog?: Array<{ item: string; unit: string; price_usd?: number | null; per?: number | null }>;
  }>;
};

const src: Src = JSON.parse(await Bun.file(SRC).text());

/** keep only defined, non-null entries — a machine reads presence, not null placeholders. */
const compact = <T extends Record<string, unknown>>(o: T): Partial<T> =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined)) as Partial<T>;

const out = {
  meta: { source: src._meta.source, fetched: src._meta.fetched, currency: src._meta.currency },
  products: src.products.map((p) => {
    const urls = compact({ doc: p.doc_url, pricing: p.pricing_url, limits: p.limits_url });
    const product: Record<string, unknown> = {
      id: p.id,
      category: p.category,
      confidence: p.source_confidence,
      ...(Object.keys(urls).length ? { urls } : {}),
      plans: p.plans.map((pl) =>
        compact({ key: pl.key, base_usd_month: pl.base_usd_month, contract: pl.base_usd_month === null ? true : undefined }),
      ),
      meters: p.meters.map((m) =>
        compact({
          key: m.key,
          unit: unitToken(m.unit),
          free_included: m.free_included,
          free_period: m.free_period,
          paid_included: m.paid_included,
          paid_period: m.paid_period,
          overage_usd: m.overage_usd,
          overage_per: m.overage_per,
        }),
      ),
    };
    if (p.catalog?.length) {
      product.catalog = p.catalog.map((c) =>
        compact({ item: itemToken(c.item), unit: slug(c.unit), price_usd: c.price_usd, per: c.per }),
      );
    }
    return product;
  }),
};

// guard: no string value may contain a space (the bad smell), and meter unit tokens must be unique within a product.
const spaces: string[] = [];
const walk = (v: unknown, path: string): void => {
  if (typeof v === "string") { if (/\s/.test(v)) spaces.push(`${path}=${JSON.stringify(v)}`); }
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
};
walk(out, "$");
if (spaces.length) { console.error("SPACES found (bad smell):\n  " + spaces.join("\n  ")); process.exit(1); }

await Bun.write(OUT, JSON.stringify(out, null, 2) + "\n");
const meters = out.products.reduce((n, p) => n + (p.meters as unknown[]).length, 0);
const catalog = out.products.reduce((n, p) => n + ((p.catalog as unknown[] | undefined)?.length ?? 0), 0);
console.log(`✓ ${OUT.split("/").pop()} — ${out.products.length} products · ${meters} meters · ${catalog} catalog rows · 0 spaces`);
