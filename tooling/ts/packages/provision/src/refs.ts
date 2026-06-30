/**
 * Binding references + fingerprints (C047) — the wiring under the provisioning DAG. A param string of the form
 * `@<ref>.<key>` names another instance's binding OUTPUT (e.g. `@db.database_id`): it's an EDGE (this instance depends on
 * `db`) and a substitution (resolved from `db`'s outputs at apply time). Pure + deterministic.
 */
import type { InstanceSpec } from "./types";

/** Matches a whole-string binding reference `@<ref>.<key>` (refs are dotted-handle → output-key). */
const REF_RE = /^@([A-Za-z0-9_-]+)\.([A-Za-z0-9_.-]+)$/;

/** Parse a single value: a `@ref.key` string → its parts, else null (not a reference). */
export function parseRef(value: unknown): { ref: string; key: string } | null {
  if (typeof value !== "string") return null;
  const m = REF_RE.exec(value);
  return m ? { ref: m[1], key: m[2] } : null;
}

/** Every instance ref a spec's params depend on (deduped) — the spec's in-edges in the DAG. */
export function depsOf(spec: InstanceSpec): string[] {
  const out = new Set<string>();
  for (const v of Object.values(spec.params ?? {})) {
    const r = parseRef(v);
    if (r) out.add(r.ref);
  }
  return [...out];
}

/** Resolve a spec's params against the accumulated outputs (ref → its output map). Throws if a referenced output is
 *  missing (a producer that didn't emit the key) — fail-closed, never silently substitute undefined into a provider call. */
export function resolveParams(spec: InstanceSpec, outputsByRef: Record<string, Record<string, string>>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(spec.params ?? {})) {
    const r = parseRef(v);
    if (!r) {
      out[k] = v;
      continue;
    }
    const producer = outputsByRef[r.ref];
    if (!producer || !(r.key in producer)) {
      throw new Error(`provision: ${spec.ref}.params.${k} references @${r.ref}.${r.key}, but ${r.ref} has no output "${r.key}"`);
    }
    out[k] = producer[r.key];
  }
  return out;
}

/** A stable JSON string (recursively sorted keys) — order-independent so a fingerprint is reproducible. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`).join(",")}}`;
}

/** The drift fingerprint of a desired instance = a stable hash of (name + plan + params). A change flips it → an `update`
 *  step; an unchanged spec matches its stored fingerprint → a `noop`. (Refs are fingerprinted as their literal `@ref.key`
 *  text — a producer's VALUE changing is the producer's own drift, surfaced on its own step.) */
export function fingerprint(spec: InstanceSpec): string {
  return stableStringify({ name: spec.name, plan: spec.plan ?? null, params: spec.params ?? {} });
}
