# Configuration

## GenerateOptions

### Properties

#### run

run a command — the CLI spawns `bunx shadcn add <ref>`; a test records.

**Type:** `(cmd: string, args: string[]) => Promise<void>`

**Required:** yes

#### write

write a file (path relative to the target cwd).

**Type:** `(path: string, content: string) => Promise<void>`

**Required:** yes

#### read

read a file (null when absent) — used to MERGE the generated package.json with the app's existing one (so app-added
 deps/scripts survive a regenerate) and to leave an existing tsconfig/components.json untouched. Optional: without it,
 the config files are written as the fresh baseline.

**Type:** `(path: string) => Promise<string | null>`

#### log

**Type:** `(msg: string) => void`