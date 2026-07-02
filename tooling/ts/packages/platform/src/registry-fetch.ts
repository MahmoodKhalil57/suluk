/**
 * The importable registry-fetcher — the `shadcn add` replacement. Instead of spawning `bunx shadcn add <ref>`, the CLI
 * IMPORTS this: it fetches `registry.json` from the repo's `main` branch, resolves each item + its `registryDependencies`
 * (recursively, deduped), fetches every file over HTTPS, and writes it to its `target`. shadcn does no content transform
 * (files are copied byte-for-byte), so a verbatim write is faithful. npm `dependencies` are collected + returned (they are
 * already in the generated package.json); the CLI runs ONE `bun install` afterward.
 */

/** A shadcn-registry item as it appears in registry.json. */
interface RegistryItem {
  name: string;
  dependencies?: string[]; // npm deps
  registryDependencies?: string[]; // other items (fully-qualified refs, e.g. "owner/repo/app")
  files?: { path: string; target?: string; type?: string }[];
}

export interface FetchRegistryOptions {
  /** write a fetched file to its target path (relative to the app root). */
  write: (path: string, content: string) => Promise<void>;
  /** progress line. */
  log?: (msg: string) => void;
  /** injectable fetch (tests). Defaults to global fetch. */
  fetch?: typeof fetch;
  /** the git ref to pull from (default "main"). */
  ref?: string;
}

export interface FetchRegistryResult {
  /** the resolved item names, dependency-first order. */
  added: string[];
  /** the union of every resolved item's npm `dependencies`. */
  deps: string[];
}

const itemName = (ref: string): string => ref.split("/").pop() ?? ref;

/**
 * Fetch + install the given registry item refs (`owner/repo/name`) and everything they build on. Writes each file to its
 * `target`; returns the resolved names (dep-first) + the collected npm deps. Throws on a missing item / a failed fetch —
 * fail-closed (never a partial scaffold silently).
 */
export async function fetchRegistry(refs: string[], opts: FetchRegistryOptions): Promise<FetchRegistryResult> {
  if (!refs.length) return { added: [], deps: [] };
  const doFetch = opts.fetch ?? fetch;
  const gitRef = opts.ref ?? "main";
  const parts = (refs[0] ?? "").split("/");
  if (parts.length < 3) throw new Error(`registry: ref "${refs[0]}" must be "owner/repo/name"`);
  const [owner, repo] = parts;
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/${gitRef}`;

  const regRes = await doFetch(`${base}/registry.json`);
  if (!regRes.ok) throw new Error(`registry: could not fetch ${base}/registry.json (${regRes.status})`);
  const reg = (await regRes.json()) as { items?: RegistryItem[] };
  const byName = new Map((reg.items ?? []).map((i) => [i.name, i]));

  // resolve each ref + its registryDependencies, DEPS FIRST, deduped (so `app` is visited/written once).
  const resolved = new Set<string>();
  const order: string[] = [];
  const deps = new Set<string>();
  const visit = (name: string): void => {
    if (resolved.has(name)) return;
    resolved.add(name);
    const it = byName.get(name);
    if (!it) throw new Error(`registry: item "${name}" not found in ${owner}/${repo}/registry.json`);
    for (const d of it.registryDependencies ?? []) visit(itemName(d));
    for (const d of it.dependencies ?? []) deps.add(d);
    order.push(name);
  };
  for (const ref of refs) visit(itemName(ref));

  // write every file (target-deduped: a file shared by two items — never re-fetched/overwritten).
  const writtenTargets = new Set<string>();
  for (const name of order) {
    const it = byName.get(name)!;
    for (const f of it.files ?? []) {
      const target = f.target ?? f.path;
      if (writtenTargets.has(target)) continue;
      writtenTargets.add(target);
      const res = await doFetch(`${base}/${f.path}`);
      if (!res.ok) throw new Error(`registry: could not fetch ${f.path} for "${name}" (${res.status})`);
      await opts.write(target, await res.text());
    }
    opts.log?.(`▸ fetched ${name}`);
  }

  return { added: order, deps: [...deps] };
}
