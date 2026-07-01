// Extract a compact UML class model from a TypeDoc class/interface reflection. Pure data — no rendering; the
// client (assets/umlclass.js) draws it with d3. Kept small (single-line types, capped) so each page's inline
// JSON stays reasonable.
import { ReflectionKind } from "typedoc";

const K = ReflectionKind;

/** UML visibility marker from flags: `-` private, `#` protected, `+` public (default). */
function visibility(flags) {
  if (flags?.isPrivate) return "-";
  if (flags?.isProtected) return "#";
  return "+";
}

/** A short single-line string for a type (whitespace collapsed, capped so a huge union can't blow up the box). */
function typeString(type) {
  if (!type) return "";
  let s = "";
  try {
    s = String(type.toString());
  } catch {
    return "";
  }
  s = s.replace(/\s+/g, " ").trim();
  return s.length > 64 ? `${s.slice(0, 61)}…` : s;
}

/** One member row → `{ kind:"attr"|"op", vis, name, static, type, params? }`. */
function member(child) {
  const flags = child.flags ?? {};
  const base = { vis: visibility(flags), name: child.name, static: !!flags.isStatic };
  if (child.kindOf(K.Method | K.Constructor) || child.signatures?.length) {
    const sig = child.signatures?.[0];
    const params = (sig?.parameters ?? []).map((p) => `${p.flags?.isRest ? "..." : ""}${p.name}`).join(", ");
    return { ...base, kind: "op", params, type: typeString(sig?.type) };
  }
  // property / accessor
  const t = child.type ?? child.getSignature?.type ?? child.setSignature?.parameters?.[0]?.type;
  return { ...base, kind: "attr", type: typeString(t) };
}

/** A related type → `{ name, relation, url? }`. `urlTo` maps a reflection to a page-relative URL (or undefined). */
function related(type, relation, urlTo) {
  const refl = type?.reflection;
  let url;
  try {
    url = refl ? urlTo(refl) : undefined;
  } catch {
    url = undefined;
  }
  return { name: type?.name ?? typeString(type) ?? "?", relation, url };
}

/**
 * Build the UML model for a class/interface reflection, or `null` for anything else.
 * @returns {null | { name:string, kind:"class"|"interface", stereotype:(string|null),
 *   attributes:object[], operations:object[], supers:object[], subs:object[] }}
 */
export function umlModel(reflection, urlTo) {
  if (!reflection || typeof reflection.kindOf !== "function" || !reflection.kindOf(K.Class | K.Interface)) return null;
  const isInterface = reflection.kindOf(K.Interface);
  const attributes = [];
  const operations = [];
  for (const c of reflection.children ?? []) {
    if (c.kindOf(K.Method | K.Constructor)) operations.push(member(c));
    else if (c.kindOf(K.Property | K.Accessor)) attributes.push(member(c));
  }
  return {
    name: reflection.name,
    kind: isInterface ? "interface" : "class",
    stereotype: isInterface ? "interface" : reflection.flags?.isAbstract ? "abstract" : null,
    attributes,
    operations,
    supers: [
      ...(reflection.extendedTypes ?? []).map((t) => related(t, "extends", urlTo)),
      ...(reflection.implementedTypes ?? []).map((t) => related(t, "implements", urlTo)),
    ],
    subs: [
      ...(reflection.extendedBy ?? []).map((t) => related(t, "extendedBy", urlTo)),
      ...(reflection.implementedBy ?? []).map((t) => related(t, "implementedBy", urlTo)),
    ],
  };
}
