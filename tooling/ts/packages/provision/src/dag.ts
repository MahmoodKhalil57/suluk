/**
 * Topological ordering of the declared instances (C047) by their binding edges (from `@ref.key` params), so every
 * instance is provisioned AFTER the producers its params reference — the binding chain (create D1 → its id feeds the
 * Worker; mint a scoped token → it feeds the secrets push). Kahn's algorithm; throws on a cycle or an unknown ref.
 */
import type { InstanceSpec } from "./types";
import { depsOf } from "./refs";

/** Order `instances` so each comes after its binding producers. Stable (config order breaks ties). Throws on a cycle or
 *  a reference to an undeclared instance. */
export function topoOrder(instances: InstanceSpec[]): InstanceSpec[] {
  const byRef = new Map(instances.map((i) => [i.ref, i]));
  const seen = new Set<string>();
  const refs = instances.map((i) => i.ref);
  if (new Set(refs).size !== refs.length) {
    const dupe = refs.find((r, idx) => refs.indexOf(r) !== idx);
    throw new Error(`provision: duplicate instance ref "${dupe}" — refs must be unique`);
  }

  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>(); // producer ref → the refs that depend on it
  for (const i of instances) {
    indegree.set(i.ref, 0);
    dependents.set(i.ref, []);
  }
  for (const i of instances) {
    for (const dep of depsOf(i)) {
      if (!byRef.has(dep)) throw new Error(`provision: ${i.ref} references @${dep}.* but no instance "${dep}" is declared`);
      indegree.set(i.ref, (indegree.get(i.ref) ?? 0) + 1);
      dependents.get(dep)!.push(i.ref);
    }
  }

  // Seed the queue in config order (stable output) with the zero-indegree instances.
  const queue = instances.filter((i) => (indegree.get(i.ref) ?? 0) === 0).map((i) => i.ref);
  const ordered: InstanceSpec[] = [];
  while (queue.length) {
    const ref = queue.shift()!;
    if (seen.has(ref)) continue;
    seen.add(ref);
    ordered.push(byRef.get(ref)!);
    for (const d of dependents.get(ref) ?? []) {
      indegree.set(d, (indegree.get(d) ?? 0) - 1);
      if ((indegree.get(d) ?? 0) === 0) queue.push(d);
    }
  }

  if (ordered.length !== instances.length) {
    const cyclic = instances.filter((i) => !seen.has(i.ref)).map((i) => i.ref);
    throw new Error(`provision: binding cycle among instances [${cyclic.join(", ")}] — a chain of @ref.key params loops`);
  }
  return ordered;
}
