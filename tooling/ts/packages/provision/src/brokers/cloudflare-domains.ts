/**
 * The Cloudflare Pages custom-domain broker (C047) — the ASYNC OSB showcase (this is the core of `provision-domains.ts`).
 * Attaching a custom hostname to a Pages project is idempotent, but the edge CERT issues over seconds-to-minutes, so this
 * is the textbook OSB last-operation flow: `provision` attaches + returns `in progress`, then `lastOperation` polls the
 * domain status until it's `active` (cert live). The project + hostname are encoded in the instance id (the OSB operation
 * anchor), so `lastOperation` + `deprovision` are self-contained — they need no params. The redirect-rule / DNS policy
 * that's specific to one app stays in that app's config, not here.
 */
import type { CloudflareClient } from "@suluk/cloudflare";
import type { Broker, Catalog, OperationState } from "../types";

interface PagesDomain {
  name: string;
  status?: string;
}

const ANCHOR = "::"; // instanceId = `${project}::${hostname}`
const catalog = (): Catalog => ({
  services: [{ id: "cloudflare-pages-domain", name: "Cloudflare Pages Custom Domain", description: "A custom hostname on a Pages project (cert issued asynchronously)", bindable: false, plans: [{ id: "standard", name: "Standard", free: true }] }],
});

export function cloudflarePagesDomain(cf: CloudflareClient): Broker {
  const domainsPath = (acct: string, project: string) => `/accounts/${acct}/pages/projects/${project}/domains`;

  return {
    catalog,
    async provision(req) {
      const project = req.params.project as string | undefined;
      if (!project) throw new Error(`provision: cloudflare-pages-domain ${req.ref} needs a params.project`);
      const hostname = req.name;
      const acct = await cf.resolveAccountId();
      const list = (await cf.request<PagesDomain[]>("GET", domainsPath(acct, project))) ?? [];
      if (!list.some((d) => d.name === hostname)) await cf.request("POST", domainsPath(acct, project), { json: { name: hostname } });
      // cert issuance is async → poll lastOperation until "active". outputs are known now (the hostname + its URL).
      const instanceId = `${project}${ANCHOR}${hostname}`;
      return { state: "in progress", operation: instanceId, instanceId, outputs: { hostname, url: `https://${hostname}` } };
    },
    async lastOperation(req) {
      const [project, hostname] = (req.instanceId ?? req.operation).split(ANCHOR);
      const acct = await cf.resolveAccountId();
      const list = (await cf.request<PagesDomain[]>("GET", domainsPath(acct, project))) ?? [];
      const status = list.find((d) => d.name === hostname)?.status ?? "pending";
      const state: OperationState = status === "active" ? "succeeded" : "in progress";
      return { state, description: status };
    },
    async deprovision(req) {
      const [project, hostname] = (req.instanceId ?? "").split(ANCHOR);
      const acct = await cf.resolveAccountId();
      await cf.request("DELETE", `${domainsPath(acct, project)}/${hostname}`);
      return { state: "succeeded" };
    },
  };
}
