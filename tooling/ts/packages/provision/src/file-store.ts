/**
 * The file-backed {@link StateStore} (C047) — the provision journal on disk (default `.suluk/provision.json`), the
 * record `plan` diffs against, like drizzle's `meta/_journal.json`. A missing file reads as empty state (a first
 * provision); a save writes pretty JSON (reviewable in a PR). Commit it: it's the source of truth for what's live.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { InstanceState, StateStore } from "./types";

export function fileStore(path = ".suluk/provision.json"): StateStore {
  return {
    async load(): Promise<InstanceState[]> {
      try {
        return JSON.parse(await readFile(path, "utf8")) as InstanceState[];
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "ENOENT") return []; // first run — no journal yet
        throw e;
      }
    },
    async save(state: InstanceState[]): Promise<void> {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, `${JSON.stringify(state, null, 2)}\n`);
    },
  };
}
