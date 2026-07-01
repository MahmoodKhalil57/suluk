/**
 * The @suluk/env binding sink (C047) — where provisioned credentials LAND: each (output → env var) goes through
 * `@suluk/env`/node's `setVar`, which writes the `.env` and POST-QUANTUM-ENCRYPTS secret values so the file stays
 * commit-safe. This closes the binding chain: `apply` resolves a token/id, the sink persists it as a typed, encrypted
 * env var the app + the next instance read. By default every binding is encrypted (the safe default); pass `plain` to
 * mark the non-secret ones (a database_id, a bucket name) readable.
 */
import { setVar } from "@suluk/env/node";
import type { BindingSink } from "./types";

type SetVarOpts = NonNullable<Parameters<typeof setVar>[2]>;

export interface EnvSinkOptions extends Omit<SetVarOpts, "plain"> {
  /** predicate: which env vars are written PLAINTEXT (non-secret). Default: none — every binding is encrypted. */
  plain?: (envVar: string) => boolean;
}

/** A {@link BindingSink} that persists bindings into a `.env` via @suluk/env (encrypted by default; commit-safe). */
export function envSink(opts: EnvSinkOptions = {}): BindingSink {
  const { plain, ...fileOpts } = opts;
  return {
    async write(outputs, mapping) {
      for (const [outKey, envVar] of Object.entries(mapping)) {
        if (!(outKey in outputs)) continue;
        await setVar(envVar, outputs[outKey], { ...fileOpts, plain: plain?.(envVar) ?? false });
      }
    },
  };
}
