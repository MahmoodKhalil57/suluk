/**
 * OSB last-operation polling (C047) — shared by `apply` (async provision) and `teardown` (async deprovision). The clock +
 * sleep are injected so the loop is deterministically testable. Throws on "failed" or timeout.
 */
import type { Broker, OperationState } from "./types";

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

const sleepReal = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Poll an async operation to a terminal state. Throws on "failed" or after `timeoutMs`. */
export async function pollToDone(
  broker: Broker,
  req: { ref: string; name: string; instanceId?: string; operation: string },
  poll: PollOptions,
  log: (m: string) => void,
): Promise<void> {
  if (!broker.lastOperation) throw new Error(`provision: ${req.ref} returned an async operation but its broker has no lastOperation()`);
  const intervalMs = poll.intervalMs ?? 2000;
  const timeoutMs = poll.timeoutMs ?? 600_000;
  const now = poll.now ?? Date.now;
  const sleep = poll.sleep ?? sleepReal;
  const start = now();
  for (;;) {
    const { state, description }: { state: OperationState; description?: string } = await broker.lastOperation(req);
    if (state === "succeeded") return;
    if (state === "failed") throw new Error(`provision: ${req.ref} operation failed${description ? ` — ${description}` : ""}`);
    if (now() - start > timeoutMs) throw new Error(`provision: ${req.ref} operation timed out after ${timeoutMs}ms`);
    log(`  … ${req.ref} ${req.operation} (in progress)`);
    await sleep(intervalMs);
  }
}
