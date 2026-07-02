// Extract a PER-PACKAGE UML class model from a TypeDoc container reflection (the module/project of a package):
// every class & interface as a box, plus the intra-package extends/implements edges between them. Pure data —
// the client (assets/umlclass.js) draws it with d3. Types are single-line + capped so the inline JSON stays small.
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
  return s.length > 40 ? `${s.slice(0, 37)}…` : s;
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
  const t = child.type ?? child.getSignature?.type ?? child.setSignature?.parameters?.[0]?.type;
  return { ...base, kind: "attr", type: typeString(t) };
}

/** One class/interface box → `{ id, name, kind, stereotype, attributes[], operations[], url }`. */
function classBox(t, urlTo) {
  const isInterface = t.kindOf(K.Interface);
  const attributes = [];
  const operations = [];
  for (const c of t.children ?? []) {
    if (c.kindOf(K.Method | K.Constructor)) operations.push(member(c));
    else if (c.kindOf(K.Property | K.Accessor)) attributes.push(member(c));
  }
  let url;
  try {
    url = urlTo(t);
  } catch {
    url = undefined;
  }
  return {
    id: t.name,
    name: t.name,
    kind: isInterface ? "interface" : "class",
    stereotype: isInterface ? "interface" : t.flags?.isAbstract ? "abstract" : null,
    attributes,
    operations,
    url,
  };
}

/**
 * Collect every class & interface in a container's subtree. Single-entry packages have their types as DIRECT
 * children of the Project; multi-entry roots (e.g. a shadcn-registry item with several `.ts` files) nest them
 * under one Module per file — so we recurse through Module/Namespace containers (but never into a class's own
 * members) to gather them all into one per-root diagram.
 */
function collectTypes(container, acc) {
  for (const c of container.children ?? []) {
    if (c.kindOf(K.Class | K.Interface)) acc.push(c);
    else if (c.kindOf(K.Module | K.Namespace)) collectTypes(c, acc);
  }
  return acc;
}

/**
 * Build the per-root UML model for a container (project/module): all its classes & interfaces as boxes, plus
 * the extends/implements edges BETWEEN them (intra-root inheritance — "relationships within the package/item").
 * Returns `null` if the container has no classes/interfaces.
 * @returns {null | { boxes: object[], edges: {from:string,to:string,kind:"extends"|"implements"}[] }}
 */
export function packageUmlModel(container, urlTo) {
  if (!container || typeof container.kindOf !== "function") return null;
  const types = collectTypes(container, []);
  if (!types.length) return null;
  const names = new Set(types.map((t) => t.name));
  const boxes = types.map((t) => classBox(t, urlTo));
  const edges = [];
  for (const t of types) {
    for (const st of t.extendedTypes ?? []) if (st?.name && names.has(st.name)) edges.push({ from: t.name, to: st.name, kind: "extends" });
    for (const it of t.implementedTypes ?? []) if (it?.name && names.has(it.name)) edges.push({ from: t.name, to: it.name, kind: "implements" });
  }
  return { boxes, edges };
}
