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
import { projectNodeAgent, type NodeAgentOptions } from "./node";

/**
 * The provider-specific deploy hint — a discriminated union (tightened from `Record<string,unknown>` once a 2nd adapter
 * landed, per the C034 follow-up). Cloudflare ships the Durable Object descriptor for `@suluk/deploy`; the Node runtime
 * is a plain long-lived process with no provisioned infra. A future adapter adds a new `kind`.
 */
export type RuntimeDeployHint =
  | { kind: "cloudflare"; durableObjects: { binding: string; className: string }[] }
  | { kind: "node" };

/** What every runtime adapter returns: owned source + the reachable sub-agent list + the deploy hint. */
export interface AgentRuntimeArtifacts {
  /** path → owned source the user writes into their project. */
  files: Record<string, string>;
  /** reachable sub-agents (each a separate runtime unit; scaffold per provider). */
  reachableSubAgents: string[];
  /** provider-specific deploy descriptor (Cloudflare → `@suluk/deploy`'s `durableObjects`; Node → none). */
  deploy: RuntimeDeployHint;
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
    return { files: a.files, reachableSubAgents: a.reachableSubAgents, deploy: { kind: "cloudflare", durableObjects: a.durableObjects } };
  },
};

/** The Node/Bun adapter — wraps `projectNodeAgent`. A plain long-lived process, so the deploy hint carries no infra. */
export const nodeRuntime: AgentRuntimeProvider<NodeAgentOptions> = {
  name: "node",
  project(doc, agentName, opts) {
    const a = projectNodeAgent(doc, agentName, opts);
    return { files: a.files, reachableSubAgents: a.reachableSubAgents, deploy: { kind: "node" } };
  },
};

/** The runtime-provider registry. Add new targets here; the interface is the contract (mirrors `@suluk/deploy`'s `providers`). */
export const runtimeProviders: Record<string, AgentRuntimeProvider> = {
  cloudflare: cloudflareRuntime as AgentRuntimeProvider,
  node: nodeRuntime as AgentRuntimeProvider,
};
