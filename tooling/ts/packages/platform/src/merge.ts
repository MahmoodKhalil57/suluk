/**
 * Merge each module's provision fragment into ONE instance set (C051). Same-ref instances — every module targets the
 * shared `ref: "db"` — are combined into one, UNIONING their migrations in fragment order (so auth's tables land before
 * the modules that reference them). Without this, two `db` instances would collide on the ref. The generated
 * provision.config calls this over the imported fragments.
 */
import type { InstanceSpec } from "@suluk/provision";

interface Migration { name: string; sql: string }

export function mergeProvision(fragments: InstanceSpec[][]): InstanceSpec[] {
  const byRef = new Map<string, InstanceSpec>();
  for (const frag of fragments) {
    for (const inst of frag) {
      const existing = byRef.get(inst.ref);
      if (!existing) {
        byRef.set(inst.ref, structuredClone(inst));
        continue;
      }
      const em = (existing.params?.migrations as Migration[] | undefined) ?? [];
      const nm = (inst.params?.migrations as Migration[] | undefined) ?? [];
      const migrations = [...em, ...nm];
      existing.params = { ...existing.params, ...inst.params, ...(migrations.length ? { migrations } : {}) };
    }
  }
  return [...byRef.values()];
}
