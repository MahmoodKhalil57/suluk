/**
 * The Workers Static-Assets upload flow: build a manifest (path → {hash,size}), open an upload session, push the
 * file buckets the API asks for, and return the COMPLETION JWT to embed in the worker's `assets.jwt`. The manifest
 * hash is the SHA-256 of the contents (hex). Idempotent: unchanged files aren't re-requested by the session, so a
 * redeploy only uploads what changed.
 */
import type { CloudflareClient } from "./client";

/** One asset: its server path (e.g. "/index.html"), bytes, and content type. */
export interface AssetFile {
  path: string;
  bytes: Uint8Array;
  contentType: string;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as unknown as ArrayBuffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** The Workers-Assets manifest hash: the first 32 hex chars (16 bytes) of the contents' SHA-256. The API rejects
 *  the full 64-char digest ("file hash size of 64 is too large"). */
export async function assetHash(bytes: Uint8Array): Promise<string> {
  return (await sha256Hex(bytes)).slice(0, 32);
}

const toBase64 = (bytes: Uint8Array): string =>
  typeof Buffer !== "undefined" ? Buffer.from(bytes).toString("base64") : btoa(String.fromCharCode(...bytes));

export interface UploadSession {
  jwt: string;
  /** the file hashes (grouped into buckets) the API still needs uploaded; empty when everything is cached. */
  buckets?: string[][];
}

/** The result of splitting Workers-Assets rule files out of an asset list. */
export interface AssetRuleFiles {
  /** the remaining files to actually upload + serve. */
  assets: AssetFile[];
  /** raw `_headers` file contents, if present — passed in the worker metadata's assets.config, NOT uploaded. */
  _headers?: string;
  /** raw `_redirects` file contents, if present. */
  _redirects?: string;
}

/**
 * Pull `_headers` / `_redirects` OUT of an asset list. Cloudflare Workers Static Assets does NOT serve these as files
 * — it parses their raw text (sent in the worker metadata's `assets.config._headers` / `._redirects`) into the
 * header/redirect rules the asset runtime applies. So they must be EXCLUDED from the upload manifest (else they'd
 * serve as public 200 blobs and the rules would never activate) and their contents routed to the config instead.
 * This mirrors exactly what wrangler does (excludes the two files, forwards their contents in the config).
 */
export function extractAssetRuleFiles(files: AssetFile[]): AssetRuleFiles {
  const out: AssetRuleFiles = { assets: [] };
  const dec = new TextDecoder();
  for (const f of files) {
    if (f.path === "/_headers") out._headers = dec.decode(f.bytes as unknown as Uint8Array);
    else if (f.path === "/_redirects") out._redirects = dec.decode(f.bytes as unknown as Uint8Array);
    else out.assets.push(f);
  }
  return out;
}

/**
 * Upload a set of static assets; returns the completion JWT for the worker metadata, or `null` when there are none.
 * When every file is already cached server-side the session returns no buckets and its own jwt IS the completion token.
 */
export async function uploadAssets(cf: CloudflareClient, scriptName: string, files: AssetFile[]): Promise<string | null> {
  if (!files.length) return null;
  const acct = await cf.resolveAccountId();

  const byHash = new Map<string, AssetFile>();
  const manifest: Record<string, { hash: string; size: number }> = {};
  for (const f of files) {
    const hash = await assetHash(f.bytes);
    manifest[f.path] = { hash, size: f.bytes.byteLength };
    byHash.set(hash, f);
  }

  const session = await cf.request<UploadSession>("POST", `/accounts/${acct}/workers/scripts/${scriptName}/assets-upload-session`, { json: { manifest } });
  let completion = session.jwt;

  for (const bucket of session.buckets ?? []) {
    const form = new FormData();
    for (const hash of bucket) {
      const f = byHash.get(hash);
      if (!f) continue;
      form.append(hash, new Blob([toBase64(f.bytes)], { type: f.contentType }), hash);
    }
    const r = await cf.request<{ jwt?: string } | null>("POST", `/accounts/${acct}/workers/assets/upload`, { query: { base64: true }, body: form, token: session.jwt });
    if (r?.jwt) completion = r.jwt; // the last successful bucket returns the completion token
  }
  return completion;
}
