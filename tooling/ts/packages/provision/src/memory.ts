/**
 * In-memory {@link StateStore} + {@link BindingSink} (C047) — the default seams for a dry-run, a test, or a `plan`
 * preview that should touch no disk. The file-backed store + the @suluk/env sink are separate adapters; these keep the
 * core dependency-free + deterministic.
 */
import type { BindingSink, InstanceState, StateStore } from "./types";

/** A StateStore over an in-memory array (cloned on load/save so callers can't mutate the journal by reference). */
export function memoryStore(initial: InstanceState[] = []): StateStore & { snapshot(): InstanceState[] } {
  let state: InstanceState[] = structuredClone(initial);
  return {
    load: () => structuredClone(state),
    save: (s) => {
      state = structuredClone(s);
    },
    snapshot: () => structuredClone(state),
  };
}

/** A BindingSink that records every (envVar → value) it lands — for assertions + a dry-run "what would be set" preview. */
export function memorySink(): BindingSink & { values: Record<string, string> } {
  const values: Record<string, string> = {};
  return {
    values,
    write(outputs, mapping) {
      for (const [outKey, envVar] of Object.entries(mapping)) {
        if (outKey in outputs) values[envVar] = outputs[outKey];
      }
    },
  };
}
