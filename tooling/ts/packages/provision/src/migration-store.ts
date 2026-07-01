/**
 * The migration store (C047) — the on-disk shape drizzle-kit uses: a committed `meta/_journal.json` (the ordered list of
 * migrations), one `NNNN_tag.json` per migration (the delta), one `meta/NNNN_snapshot.json` per migration (the
 * point-in-time desired state), and an env-local `meta/_applied.json` (which migrations THIS environment has run — like
 * drizzle's `__drizzle_migrations` table; gitignore it, prod ≠ preview). The memory impl is for tests/dry-runs.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { EMPTY_SNAPSHOT, SNAPSHOT_VERSION, type Snapshot } from "./snapshot";
import type { Migration } from "./migration";

export interface MigrationJournal {
  version: string;
  entries: { idx: number; tag: string }[];
}

export interface MigrationStore {
  /** the latest committed snapshot, or EMPTY when there are no migrations yet. */
  lastSnapshot(): Promise<Snapshot>;
  loadSnapshot(idx: number): Promise<Snapshot | null>;
  /** all migrations, in index order. */
  listMigrations(): Promise<Migration[]>;
  /** write a new migration + its snapshot, appending the journal. */
  write(migration: Migration, snapshot: Snapshot): Promise<void>;
  /** which migration indices THIS environment has applied. */
  applied(): Promise<number[]>;
  markApplied(idx: number): Promise<void>;
}

/** An in-memory migration store (tests / dry-runs). */
export function memoryMigrationStore(): MigrationStore {
  const migrations: Migration[] = [];
  const snapshots = new Map<number, Snapshot>();
  const appliedSet: number[] = [];
  return {
    async lastSnapshot() {
      const last = migrations.at(-1);
      return last ? snapshots.get(last.idx) ?? EMPTY_SNAPSHOT : EMPTY_SNAPSHOT;
    },
    async loadSnapshot(idx) {
      return snapshots.get(idx) ?? null;
    },
    async listMigrations() {
      return migrations.map((m) => ({ ...m }));
    },
    async write(migration, snap) {
      migrations.push(migration);
      snapshots.set(snap.idx, snap);
    },
    async applied() {
      return [...appliedSet];
    },
    async markApplied(idx) {
      if (!appliedSet.includes(idx)) appliedSet.push(idx);
    },
  };
}

/** A file-backed migration store rooted at `dir` (default `provision/`). Commits `NNNN_tag.json` + `meta/_journal.json` +
 *  `meta/NNNN_snapshot.json`; keeps the env-local `meta/_applied.json` (gitignore it). */
export function fileMigrationStore(dir = "provision"): MigrationStore {
  const meta = join(dir, "meta");
  const journalPath = join(meta, "_journal.json");
  const appliedPath = join(meta, "_applied.json");
  const pretty = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;

  async function readJson<T>(path: string, fallback: T): Promise<T> {
    try {
      return JSON.parse(await readFile(path, "utf8")) as T;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return fallback;
      throw e;
    }
  }
  const pad = (idx: number) => String(idx).padStart(4, "0");
  const journal = () => readJson<MigrationJournal>(journalPath, { version: SNAPSHOT_VERSION, entries: [] });
  const loadSnapshot = (idx: number) => readJson<Snapshot | null>(join(meta, `${pad(idx)}_snapshot.json`), null);

  return {
    async lastSnapshot() {
      const j = await journal();
      const last = j.entries.at(-1);
      return last ? (await loadSnapshot(last.idx)) ?? EMPTY_SNAPSHOT : EMPTY_SNAPSHOT;
    },
    loadSnapshot,
    async listMigrations() {
      const j = await journal();
      return Promise.all(j.entries.map((e) => readJson<Migration>(join(dir, `${e.tag}.json`), { idx: e.idx, tag: e.tag, steps: [] })));
    },
    async write(migration, snap) {
      await mkdir(meta, { recursive: true });
      await writeFile(join(dir, `${migration.tag}.json`), pretty(migration));
      await writeFile(join(meta, `${pad(snap.idx)}_snapshot.json`), pretty(snap));
      const j = await journal();
      j.entries.push({ idx: migration.idx, tag: migration.tag });
      await writeFile(journalPath, pretty(j));
    },
    async applied() {
      return readJson<number[]>(appliedPath, []);
    },
    async markApplied(idx) {
      await mkdir(meta, { recursive: true });
      const a = await readJson<number[]>(appliedPath, []);
      if (!a.includes(idx)) {
        a.push(idx);
        await writeFile(appliedPath, pretty(a));
      }
    },
  };
}
