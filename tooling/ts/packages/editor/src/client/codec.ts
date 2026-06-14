/**
 * Permalink + autosave codec. The whole document travels in the URL hash so a link is fully self-contained (no server,
 * no storage) — gzip-compressed via the platform CompressionStream when present, else plain base64url. Autosave keeps
 * the last edit in localStorage so a reload doesn't lose work.
 */
const LS_KEY = "suluk-editor:v1";

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function gzip(s: string): Promise<Uint8Array> {
  const input = new TextEncoder().encode(s);
  if (typeof CompressionStream === "undefined") return input;
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  void writer.write(input as BufferSource); void writer.close();
  const buf = await new Response(cs.readable).arrayBuffer();
  return new Uint8Array(buf);
}
async function gunzip(bytes: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === "undefined") return new TextDecoder().decode(bytes);
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  void writer.write(bytes as BufferSource); void writer.close();
  const buf = await new Response(ds.readable).arrayBuffer();
  return new TextDecoder().decode(buf);
}

/** Encode editor state into a hash fragment value (without the leading '#'). */
export async function encodeShare(text: string, format: "json" | "yaml"): Promise<string> {
  const payload = JSON.stringify({ f: format, t: text });
  try {
    const gz = await gzip(payload);
    return "g=" + toBase64Url(gz);
  } catch {
    return "b=" + toBase64Url(new TextEncoder().encode(payload));
  }
}

/** Decode a hash fragment (with or without leading '#') back into editor state, or null if it isn't ours. */
export async function decodeShare(hash: string): Promise<{ text: string; format: "json" | "yaml" } | null> {
  const h = hash.replace(/^#/, "");
  const params = new URLSearchParams(h);
  const g = params.get("g"); const b = params.get("b");
  try {
    let payload: string;
    if (g) payload = await gunzip(fromBase64Url(g));
    else if (b) payload = new TextDecoder().decode(fromBase64Url(b));
    else return null;
    const obj = JSON.parse(payload) as { f?: string; t?: string };
    if (typeof obj.t !== "string") return null;
    return { text: obj.t, format: obj.f === "yaml" ? "yaml" : "json" };
  } catch { return null; }
}

export function saveLocal(text: string, format: "json" | "yaml"): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ f: format, t: text })); } catch { /* quota / disabled */ }
}
export function loadLocal(): { text: string; format: "json" | "yaml" } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as { f?: string; t?: string };
    if (typeof obj.t !== "string") return null;
    return { text: obj.t, format: obj.f === "yaml" ? "yaml" : "json" };
  } catch { return null; }
}
