/**
 * C058 — the single-source URL derivation (PURE, generator-internal, build-time ONLY). The manifest declares TWO bare
 * hosts once — `LIVE_BASE_URL` (the production host) + `LOCAL_BASE_URL` (the local-runtime host) — WITHOUT protocol; every
 * other URL is DERIVED here and BAKED by `resolve.ts` into the Worker `[vars]` (from the live host) and the bun-dev env
 * (from the local host). Registry consumers stay dumb env-readers (they never import this), so the golden path is unchanged
 * and there is no URL authored twice. Never runs at app runtime.
 */

/** strip protocol + trailing slash(es) + any path, leaving `host[:port]`. */
const strip = (h: string): string => h.replace(/^https?:\/\//, "").replace(/\/+$/, "").split("/")[0];
/** the bare hostname (no port). */
const hostname = (h: string): string => strip(h).split(":")[0];
/** the port, or "" when none. */
const port = (h: string): string => { const m = strip(h).match(/:(\d+)$/); return m ? m[1] : ""; };

/** LOCAL is decided by HOSTNAME ONLY — never by port presence (so `example.com:8443` is NOT misclassified as local). */
export function isLocal(h: string): boolean {
  const n = hostname(h);
  return n === "localhost" || n === "127.0.0.1" || n === "0.0.0.0" || n === "::1" || n.endsWith(".local");
}

/** Protocol rule: a local hostname → http, a real domain → https. Default ports (:80 http, :443 https) are STRIPPED so a
 *  derived origin exact-matches the browser `Origin` header. */
export function withProtocol(h: string): string {
  const bare = strip(h);
  const proto = isLocal(h) ? "http" : "https";
  const p = port(h);
  const dropDefault = (proto === "https" && p === "443") || (proto === "http" && p === "80");
  return `${proto}://${dropDefault ? hostname(h) : bare}`;
}

/** the apex-ish host: the bare hostname minus a leading `www.` (NOT an eTLD+1 resolver — `api.example.com` stays as-is). */
export function apex(h: string): string {
  return hostname(h).replace(/^www\./, "");
}

/** true when the live host is a SUBDOMAIN (e.g. `api.example.com`) — a hint that `noreply@<host>` may not be a verified
 *  sending domain, so an `EMAIL_DOMAIN` override is advisable. */
export function isSubdomain(h: string): boolean {
  return apex(h).split(".").length > 2;
}

export interface DerivedUrls {
  BETTER_AUTH_URL: string;
  BASE_URL: string;
  TRUSTED_ORIGINS: string;
  EMAIL_FROM: string;
  /** the mcp OAuth trio + scopes — ALWAYS anchored to the LIVE host (a public authorization-server identity). */
  mcp: { loginPage: string; consentPage: string; resource: string; scopes: string[] };
}

export interface DeriveOptions {
  scopes?: string[];
  /** override the email sending domain (else the live apex). */
  emailDomain?: string;
  /** extra CORS origins to append (e.g. a separate SPA host or `*.pages.dev` previews). */
  extraOrigins?: string[];
}

/**
 * Derive every URL var for ONE runtime. `runtimeHost` = the host `BASE_URL`/`BETTER_AUTH_URL`/`TRUSTED_ORIGINS` resolve to
 * for THIS runtime (the live host on the Worker; the local host in bun-dev). `liveHost` = the production host, which ALWAYS
 * drives `EMAIL_FROM` + the mcp OAuth identity (baked into shared code = physically one value).
 */
export function deriveUrls(runtimeHost: string, liveHost: string, o: DeriveOptions = {}): DerivedUrls {
  const base = withProtocol(runtimeHost);
  const live = withProtocol(liveHost);
  const liveApex = apex(liveHost);
  // origin allowlist: this runtime's own origin + the live apex + live www (so a pre-redirect www hit isn't CORS-rejected)
  // + any operator EXTRA_TRUSTED_ORIGINS. A Set dedupes (on the Worker, base === the live apex origin).
  const origins = new Set<string>([base, withProtocol(liveApex), withProtocol(`www.${liveApex}`), ...(o.extraOrigins ?? [])]);
  return {
    BETTER_AUTH_URL: base,
    BASE_URL: base,
    TRUSTED_ORIGINS: [...origins].join(","),
    EMAIL_FROM: `noreply@${o.emailDomain ?? liveApex}`,
    mcp: { loginPage: `${live}/oauth/sign-in`, consentPage: `${live}/oauth/consent`, resource: `${live}/api/mcp`, scopes: o.scopes ?? [] },
  };
}
