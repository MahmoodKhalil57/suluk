/**
 * The AGENT-RUNTIME SEAM (C034) — a SWAPPABLE provider interface so projecting an agent into a runtime is an ADAPTER,
 * not a hard-wired call. Cloudflare is the FIRST runtime adapter (it wraps `projectCloudflareAgent`); the interface is
 * the contract a future Node / Vercel / self-hosted agent runtime implements, so adding one is a new adapter, never a
 * rewrite of the callers. It mirrors `@suluk/deploy`'s `DeployProvider` / `providers` (one provider per target + a
 * name-keyed registry) — the same "swap the target, keep the contract" move, one layer up (the runtime, not the deploy
 * plan). One deliberate divergence: this interface is GENERIC in its `opts` (`<O>`) so each adapter keeps typed options,
 * which is why the registry stores `cloudflareRuntime as AgentRuntimeProvider` (a harmless erase-to-base cast the
 * non-generic deploy seam doesn't need); callers wanting typed opts use the named `cloudflareRuntime` export directly.
 *
 * L3 line (C023) holds at the seam: a runtime provider RENDERS owned source the user controls — it never hosts, opens
 * a socket, or holds a credential. The interface returns source STRINGS + a provider-specific deploy hint; the host
 * writes the files and deploys.
 */
import type { OpenAPIv4Document } from "@suluk/core";
import { projectCloudflareAgent, type CloudflareAgentOptions } from "./cloudflare";

/** What every runtime adapter returns: owned source + the reachable sub-agent list + an optional provider deploy hint. */
export interface AgentRuntimeArtifacts {
  /** path → owned source the user writes into their project. */
  files: Record<string, string>;
  /** reachable sub-agents (each a separate runtime unit; scaffold per provider). */
  reachableSubAgents: string[];
  /** provider-specific deploy descriptor (Cloudflare: `{ durableObjects }` for `@suluk/deploy`); absent when the runtime needs none. */
  deploy?: Record<string, unknown>;
}

/** A runtime target. PURE: it projects the agent into owned source; the host writes the files + deploys (mirrors DeployProvider). */
export interface AgentRuntimeProvider<O = Record<string, unknown>> {
  name: string;
  project(doc: OpenAPIv4Document, agentName: string, opts?: O): AgentRuntimeArtifacts;
}

/** The Cloudflare adapter — wraps `projectCloudflareAgent` into the generic seam (its `durableObjects` → the deploy hint). */
export const cloudflareRuntime: AgentRuntimeProvider<CloudflareAgentOptions> = {
  name: "cloudflare",
  project(doc, agentName, opts) {
    const a = projectCloudflareAgent(doc, agentName, opts);
    return { files: a.files, reachableSubAgents: a.reachableSubAgents, deploy: { durableObjects: a.durableObjects } };
  },
};

/** The runtime-provider registry. Add new targets here; the interface is the contract (mirrors `@suluk/deploy`'s `providers`). */
export const runtimeProviders: Record<string, AgentRuntimeProvider> = {
  cloudflare: cloudflareRuntime as AgentRuntimeProvider,
};
