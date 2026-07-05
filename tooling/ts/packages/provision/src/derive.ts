/**
 * `deriveInstanceSpecs` — the OSB-artifact PROJECTOR (C101). The analog of `@suluk/hono`'s `emitAsyncApi`, but for
 * infrastructure: reads a v4 "Suluk" document's `x-suluk-provision` facet (`@suluk/core`'s `SulukProvisionInstance`,
 * the light "broker intent" annotation — no OSB wire ceremony) and projects it into this package's own {@link
 * InstanceSpec}[] — the exact shape `plan`/`apply`/`generate` already consume, unchanged.
 *
 * "Author domain once, annotate broker intent, generate OSB artifacts": an app author declares a need ONCE, on the
 * SAME v4 document that also carries its routes/jobs/webhooks, instead of hand-authoring a fully independent
 * `InstanceSpec[]` fragment with no structural link back to what consumes it. The output slots into the EXISTING
 * `{symbol, from}` catalog-fragment mechanism unmodified — a registry module can `export const xProvision:
 * InstanceSpec[] = deriveInstanceSpecs(document)` exactly where it previously hand-wrote the array literal.
 *
 * PURE + total: an absent/empty `x-suluk-provision` map yields `[]` (an honest "no provisioning need declared" —
 * mirrors `emitAsyncApi`'s "no event surface" empty-document case). The map's key becomes `InstanceSpec.ref` (the
 * facet omits `ref` — implied by the key, C009 by-name identity); every other field copies verbatim.
 */
import type { OpenAPIv4Document } from "@suluk/core";
import type { InstanceSpec } from "./types";

/** Project a v4 document's `x-suluk-provision` facet into an `InstanceSpec[]` (stable order: `Object.entries` insertion order). */
export function deriveInstanceSpecs(doc: OpenAPIv4Document): InstanceSpec[] {
  const facet = doc["x-suluk-provision"];
  if (!facet) return [];
  return Object.entries(facet).map(([ref, inst]) => {
    const spec: InstanceSpec = { ref, service: inst.service, name: inst.name };
    if (inst.plan !== undefined) spec.plan = inst.plan;
    if (inst.params !== undefined) spec.params = inst.params;
    if (inst.bind !== undefined) spec.bind = inst.bind;
    if (inst.protected !== undefined) spec.protected = inst.protected;
    return spec;
  });
}
