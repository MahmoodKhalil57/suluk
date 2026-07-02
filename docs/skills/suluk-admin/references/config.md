# Configuration

## AdminOptions

`@suluk/admin` — the /superadmin web admin panel. The SAME cockpit as the vscode extension (@suluk/cockpit
core), rendered as Hono-served web pages and gated to superadmins. One brain, two faces. Mount it on your
app: `app.route("/", adminApp({ document, authorize }))`. CANDIDATE tooling — NOT official OAS.

### Properties

#### document

The hub v4 document — a value, or a function (so the panel reflects live state per request).

**Type:** `OpenAPIv4Document | ((c: Context) => OpenAPIv4Document | Promise<OpenAPIv4Document>)`

**Required:** yes

#### basePath

Mount path (default "/superadmin").

**Type:** `string`

#### authorize

Gate: return true to allow. Wire to your auth (superadmin only). DEFAULT: deny everything.

**Type:** `(c: Context) => boolean | Promise<boolean>`

#### title

Page title.

**Type:** `string`

#### headHtml

Extra HTML injected into <head> AFTER the default theme — link a stylesheet (e.g. a color-scheme sheet) and a
 no-flash theme stamper so the panel obeys the host app's light/dark + color scheme instead of the built-in.

**Type:** `string | ((c: Context) => string)`