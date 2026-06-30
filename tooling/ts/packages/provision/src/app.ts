/**
 * The provision "app" (C047) — what a `provision.config.ts` exports, the drizzle-kit `drizzle.config.ts` analog. It binds
 * the declarative config (the desired instances) to the runtime wiring the CLI needs: the broker registry (service id →
 * the executor that talks to the provider), the state journal, and the binding sink. `plan`/`check`/`status` need only
 * the config + journal; `apply` needs the brokers + sink. `defineProvisionApp` validates the config up front.
 */
import type { Broker, BindingSink, StateStore } from "./types";
import { defineProvision, type ProvisionConfig } from "./config";

export interface ProvisionApp {
  /** the desired instances (+ pruneOrphans default). */
  config: ProvisionConfig;
  /** service id → broker (the executors `apply` dispatches to). */
  brokers: Record<string, Broker>;
  /** the journal (defaults to a file store in a real config). */
  store: StateStore;
  /** where bound credentials land (defaults to the @suluk/env sink). Optional. */
  sink?: BindingSink;
}

/** Validate + return a provision app config (the CLI imports this as the config file's default export). */
export function defineProvisionApp(app: ProvisionApp): ProvisionApp {
  defineProvision(app.config); // throws on dup ref / unknown ref / cycle
  return app;
}
