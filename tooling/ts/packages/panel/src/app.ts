/** panelApp — a contract-first dashboard framework. Mount at `basePath` (default /panel): a stat-card + grouped
 *  home, a list + create/edit form for every entity the (per-role projected) document exposes, AND host-injected
 *  custom NON-CRUD sections (profile, billing, danger zone, …) rendered inside the same shell. Pass a PROJECTED
 *  document (per role) and you get a per-role dashboard for free — admin sees everything, a user sees only their
 *  own. Gated by `authorize`; themed via `headHtml`. Backward-compatible: omit stats/groups/sections for a plain
 *  CRUD admin. */
import { Hono, type Context } from "hono";
import type { OpenAPIv4Document } from "@suluk/core";
import { entityModels, type EntityModel } from "./model";
import { renderShell, type NavGroup, type NavItem } from "./shell";
import { renderList } from "./list";
import { renderForm } from "./form";

/** A KPI tile on the dashboard home. */
export interface StatCard { label: string; value: string | number; hint?: string; href?: string }
/** A custom, non-CRUD page mounted at `${basePath}/s/<id>`, rendered inside the panel shell. */
export interface PanelSection {
  id: string;
  label: string;
  /** short line shown on the home card (else "Open"). */
  summary?: string;
  /** Inner HTML for the section body (may include <script>); receives the request context. */
  render: (c: Context) => string | Promise<string>;
}
/** Sidebar grouping: a titled section listing entity names and/or section ids, in order. */
export interface PanelGroup { title: string; entities?: string[]; sections?: string[] }

export interface PanelOptions {
  /** The v4 document — a value, or a per-request function (e.g. return projectDocument(doc, roleOf(c))). */
  document: OpenAPIv4Document | ((c: Context) => OpenAPIv4Document | Promise<OpenAPIv4Document>);
  basePath?: string;
  /** Brand shown in the sidebar + titles. */
  title?: string;
  /** Gate — return true to allow. Default: deny everything. */
  authorize?: (c: Context) => boolean | Promise<boolean>;
  /** Injected into <head> after the default theme (link a color-scheme sheet + stamper to follow the host theme). */
  headHtml?: string | ((c: Context) => string);
  /** Field names to omit from every entity. */
  hide?: string[];
  /** Entity names to omit from the panel entirely (e.g. ones you handle via a custom `section` instead). */
  hideEntities?: string[];
  /** Endpoint that accepts a `multipart/form-data` `file` and returns `{ url }` — enables the media field's upload
   *  button (e.g. an R2-backed worker route). Omit and media fields are paste-a-URL only. */
  uploadPath?: string;
  /** Dashboard-framework extras (all optional — omit for a plain CRUD admin). Each may be a per-request FUNCTION so
   *  the dashboard adapts to WHO is logged in — a bespoke, role-dependent product dashboard, not a generic CRUD index. */
  stats?: StatCard[] | ((c: Context) => StatCard[] | Promise<StatCard[]>);
  groups?: PanelGroup[] | ((c: Context) => PanelGroup[] | Promise<PanelGroup[]>);
  sections?: PanelSection[] | ((c: Context) => PanelSection[] | Promise<PanelSection[]>);
  /** Replace the auto-generated home (stat cards + entity/section cards) with a BESPOKE overview — your product's
   *  landing page (welcome, recent activity, recommendations, quick actions). Stat cards, when set, render above it. */
  home?: (c: Context) => string | Promise<string>;
  /** Heading on the dashboard home (default "Dashboard"). */
  homeHeading?: string | ((c: Context) => string | Promise<string>);
  /** Label of the home nav link (default "Dashboard"). */
  homeLabel?: string;
}

const esc = (s: unknown): string => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

function statCardHtml(s: StatCard): string {
  const inner = `<div class="pf-stat-l">${esc(s.label)}</div><div class="pf-stat-v">${esc(String(s.value))}</div>${s.hint ? `<div class="pf-stat-h">${esc(s.hint)}</div>` : ""}`;
  return s.href ? `<a class="pf-stat" href="${esc(s.href)}">${inner}</a>` : `<div class="pf-stat">${inner}</div>`;
}

/** Build the grouped sidebar nav: items are entity names or `s:<sectionId>`. Respects `groups` order; anything not
 *  placed falls into a trailing "Other" group. With no groups, entities go under "Collections", sections under "More". */
function buildNav(base: string, ms: EntityModel[], sections: PanelSection[], groups?: PanelGroup[]): NavGroup[] {
  const entityNames = new Set(ms.map((m) => m.name));
  const byId = new Map(sections.map((s) => [s.id, s]));
  const item = (name: string): NavItem =>
    name.startsWith("s:") ? { name, label: byId.get(name.slice(2))?.label ?? name.slice(2), href: `${base}/s/${name.slice(2)}` }
      : { name, label: name, href: `${base}/${name}` };
  if (groups?.length) {
    const out: NavGroup[] = [];
    const used = new Set<string>();
    for (const g of groups) {
      const items: NavItem[] = [];
      for (const e of g.entities ?? []) if (entityNames.has(e) && !used.has(e)) { items.push(item(e)); used.add(e); }
      for (const sid of g.sections ?? []) if (byId.has(sid) && !used.has("s:" + sid)) { items.push(item("s:" + sid)); used.add("s:" + sid); }
      if (items.length) out.push({ title: g.title, items });
    }
    const leftover = [...ms.filter((m) => !used.has(m.name)).map((m) => item(m.name)), ...sections.filter((s) => !used.has("s:" + s.id)).map((s) => item("s:" + s.id))];
    if (leftover.length) out.push({ title: "Other", items: leftover });
    return out;
  }
  const out: NavGroup[] = [{ title: "Collections", items: ms.map((m) => item(m.name)) }];
  if (sections.length) out.push({ title: "More", items: sections.map((s) => item("s:" + s.id)) });
  return out;
}

export function panelApp(opts: PanelOptions): Hono {
  const base = (opts.basePath ?? "/panel").replace(/\/$/, "");
  const brand = opts.title ?? "Panel";
  const authorize = opts.authorize ?? (() => false);
  const homeLabel = opts.homeLabel ?? "Dashboard";
  const app = new Hono();

  app.use(base, gate); app.use(`${base}/*`, gate);
  async function gate(c: Context, next: () => Promise<void>) { if (!(await authorize(c))) return c.text("403 — not authorized", 403); await next(); }

  const head = (c: Context) => (typeof opts.headHtml === "function" ? opts.headHtml(c) : (opts.headHtml ?? ""));
  const hidden = new Set(opts.hideEntities ?? []);
  // Resolve the per-request bits — each may be a value OR a function of `c`, so the whole dashboard adapts to the role.
  const resolveSections = async (c: Context): Promise<PanelSection[]> => (typeof opts.sections === "function" ? await opts.sections(c) : opts.sections) ?? [];
  const resolveGroups = async (c: Context): Promise<PanelGroup[] | undefined> => (typeof opts.groups === "function" ? await opts.groups(c) : opts.groups);
  async function models(c: Context): Promise<EntityModel[]> {
    const doc = typeof opts.document === "function" ? await opts.document(c) : opts.document;
    const all = entityModels(doc as never, { hide: opts.hide });
    return hidden.size ? all.filter((m) => !hidden.has(m.name)) : all;
  }
  const rels = (ms: EntityModel[]) => Object.fromEntries(ms.map((m) => [m.name, m.path]));
  // Sidebar chrome — resolves sections + groups for THIS request so the nav reflects the caller's role.
  async function chrome(c: Context, ms: EntityModel[]) {
    return { title: brand, brand, basePath: base, nav: buildNav(base, ms, await resolveSections(c), await resolveGroups(c)), homeLabel, headHtml: head(c) };
  }

  app.get(base, async (c) => {
    const ms = await models(c);
    const sections = await resolveSections(c);
    const groups = await resolveGroups(c);
    const statCards = typeof opts.stats === "function" ? await opts.stats(c) : (opts.stats ?? []);
    const statsHtml = statCards.length ? `<div class="pf-stats">${statCards.map(statCardHtml).join("")}</div>` : "";
    // A custom `home` (a bespoke product overview) replaces the auto card-grid; stats still render above it.
    let main: string;
    if (opts.home) {
      main = await opts.home(c);
    } else {
      main = buildNav(base, ms, sections, groups).map((g) => {
        const cards = g.items.map((it) => {
          if (it.name.startsWith("s:")) { const s = sections.find((x) => x.id === it.name.slice(2))!; return `<a class="pf-card" href="${base}/s/${esc(s.id)}"><b>${esc(s.label)}</b><p>${esc(s.summary ?? "Open")}</p></a>`; }
          const m = ms.find((x) => x.name === it.name); if (!m) return "";
          const ops = [m.access.create ? "create" : "", m.access.update ? "edit" : "", m.access.delete ? "delete" : ""].filter(Boolean).join(" · ") || "read-only";
          return `<a class="pf-card" href="${base}/${esc(m.name)}"><b>${esc(m.name)}</b><p>${m.fields.length} fields · ${ops}</p></a>`;
        }).join("");
        return cards ? `<div class="pf-group"><div class="pf-navhead">${esc(g.title)}</div><div class="pf-cards">${cards}</div></div>` : "";
      }).join("") || `<p class="pf-muted">Nothing to manage yet.</p>`;
    }
    const heading = typeof opts.homeHeading === "function" ? await opts.homeHeading(c) : (opts.homeHeading ?? "Dashboard");
    return c.html(renderShell({ title: brand, brand, basePath: base, nav: buildNav(base, ms, sections, groups), homeLabel, headHtml: head(c), active: "", heading, body: statsHtml + main }));
  });

  // Custom sections at `${base}/s/:id` — the static "s" segment beats the `:entity` param, so it never collides.
  app.get(`${base}/s/:id`, async (c) => {
    const sections = await resolveSections(c);
    const s = sections.find((x) => x.id === c.req.param("id")); if (!s) return c.notFound();
    const ms = await models(c);
    const body = await s.render(c);
    return c.html(renderShell({ ...(await chrome(c, ms)), active: `s:${s.id}`, heading: s.label, crumbs: [{ label: homeLabel, href: base }, { label: s.label }], body }));
  });

  app.get(`${base}/:entity`, async (c) => {
    const ms = await models(c); const m = ms.find((x) => x.name === c.req.param("entity")); if (!m) return c.notFound();
    return c.html(renderShell({ ...(await chrome(c, ms)), active: m.name, heading: m.name,
      crumbs: [{ label: homeLabel, href: base }, { label: m.name }], body: renderList(m, { basePath: base }) }));
  });

  app.get(`${base}/:entity/:action`, async (c) => {
    const ms = await models(c); const m = ms.find((x) => x.name === c.req.param("entity")); if (!m) return c.notFound();
    const editing = c.req.param("action") === "edit";
    if (editing ? !m.access.update : !m.access.create) return c.text("403 — not allowed", 403);
    return c.html(renderShell({ ...(await chrome(c, ms)), active: m.name, heading: editing ? `Edit ${m.name}` : `New ${m.name}`,
      crumbs: [{ label: homeLabel, href: base }, { label: m.name, href: `${base}/${m.name}` }, { label: editing ? "Edit" : "New" }],
      body: renderForm(m, { basePath: base, relPaths: rels(ms), canDelete: editing && m.access.delete, uploadPath: opts.uploadPath }) }));
  });

  return app;
}
