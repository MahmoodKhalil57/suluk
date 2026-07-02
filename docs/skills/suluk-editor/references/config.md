# Configuration

## EditorOptions

### Properties

#### pageTitle

Browser <title> + toolbar heading suffix.

**Type:** `string`

#### brand

Brand shown in the toolbar (default "Suluk").

**Type:** `string`

#### forkSrc

URL of the suluk Scalar fork standalone bundle (defines window.Scalar). Default "/vendor/scalar/standalone-suluk.js".

**Type:** `string`

#### clientSrc

URL of the built editor client bundle (this package's dist/editor.client.js). Default "/editor.client.js".

**Type:** `string`

#### faviconHref

Favicon href.

**Type:** `string`

#### examples

Seed documents for the Examples dropdown (default: this package's examples).

**Type:** `EditorExample[]`

#### initialDoc

Document the editor opens with when there is no ?url=, #share, or saved draft. Default: the Suluk Galaxy example.

**Type:** `unknown`

#### customCss

Extra CSS appended to the page.

**Type:** `string`