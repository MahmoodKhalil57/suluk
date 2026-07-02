# Configuration

## FieldsOptions

`@suluk/panel` — contract-first admin panels, in the spirit of Payload but projected from ONE OpenAPI v4 document.
Payload makes you configure collections in a framework-coupled DSL; @suluk/panel INFERS the same field types
(text/textarea/richtext/number/boolean/select/date/email/url/json/relationship) straight from the contract's
component schemas, renders shadcn/theme-aware forms + data tables, and mounts a role-aware admin — pass a
per-role PROJECTED document and you get a per-role dashboard for free. No DB coupling (it drives the contract's
REST), no config drift (the contract is the single source). CANDIDATE tooling.

### Properties

#### hide

**Type:** `string[]`

#### readOnly

**Type:** `string[]`

## ListOptions

### Properties

#### basePath

**Type:** `string`

**Required:** yes

## FormOptions

### Properties

#### basePath

**Type:** `string`

**Required:** yes

#### relPaths

**Type:** `Record<string, string>`

**Required:** yes

#### canDelete

**Type:** `boolean`

**Required:** yes

#### uploadPath

**Type:** `string`

## ShellOptions

### Properties

#### title

**Type:** `string`

**Required:** yes

#### brand

**Type:** `string`

**Required:** yes

#### basePath

**Type:** `string`

**Required:** yes

#### entities

Flat collections nav (legacy/simple form). Ignored when `nav` is provided.

**Type:** `{ name: string; count?: number }[]`

#### nav

Grouped sidebar nav (dashboard-framework form): one section per group, each with its items.

**Type:** `NavGroup[]`

#### homeLabel

Label for the home/dashboard nav link (default "Dashboard").

**Type:** `string`

#### active

**Type:** `string`

**Required:** yes

#### heading

**Type:** `string`

**Required:** yes

#### body

**Type:** `string`

**Required:** yes

#### headHtml

**Type:** `string`

#### crumbs

**Type:** `{ label: string; href?: string }[]`

## PanelOptions

### Properties

#### document

The v4 document — a value, or a per-request function (e.g. return projectDocument(doc, roleOf(c))).

**Type:** `OpenAPIv4Document | ((c: Context) => OpenAPIv4Document | Promise<OpenAPIv4Document>)`

**Required:** yes

#### basePath

**Type:** `string`

#### title

Brand shown in the sidebar + titles.

**Type:** `string`

#### authorize

Gate — return true to allow. Default: deny everything.

**Type:** `(c: Context) => boolean | Promise<boolean>`

#### headHtml

Injected into <head> after the default theme (link a color-scheme sheet + stamper to follow the host theme).

**Type:** `string | ((c: Context) => string)`

#### hide

Field names to omit from every entity.

**Type:** `string[]`

#### hideEntities

Entity names to omit from the panel entirely (e.g. ones you handle via a custom `section` instead).

**Type:** `string[]`

#### uploadPath

Endpoint that accepts a `multipart/form-data` `file` and returns `{ url }` — enables the media field's upload
 button (e.g. an R2-backed worker route). Omit and media fields are paste-a-URL only.

**Type:** `string`

#### stats

Dashboard-framework extras (all optional — omit for a plain CRUD admin). Each may be a per-request FUNCTION so
 the dashboard adapts to WHO is logged in — a bespoke, role-dependent product dashboard, not a generic CRUD index.

**Type:** `StatCard[] | ((c: Context) => StatCard[] | Promise<StatCard[]>)`

#### groups

**Type:** `PanelGroup[] | ((c: Context) => PanelGroup[] | Promise<PanelGroup[]>)`

#### sections

**Type:** `PanelSection[] | ((c: Context) => PanelSection[] | Promise<PanelSection[]>)`

#### home

Replace the auto-generated home (stat cards + entity/section cards) with a BESPOKE overview — your product's
 landing page (welcome, recent activity, recommendations, quick actions). Stat cards, when set, render above it.

**Type:** `(c: Context) => string | Promise<string>`

#### homeHeading

Heading on the dashboard home (default "Dashboard").

**Type:** `string | ((c: Context) => string | Promise<string>)`

#### homeLabel

Label of the home nav link (default "Dashboard").

**Type:** `string`