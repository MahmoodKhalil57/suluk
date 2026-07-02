# Configuration

## CssVarsOptions

### Properties

#### selector

the selector to scope the vars under (default ":root").

**Type:** `string`

## ThemeCssOptions

### Properties

#### darkSelector

the selector under which the dark scheme's vars apply (default "[data-theme='dark']" — saastarter's convention).

**Type:** `string`

## BaseCssOptions

### Properties

#### ring

CSS value for keyboard focus rings (default the theme's `var(--ring)`). Pass your own accent var if your app
 uses a different color vocabulary.

**Type:** `string`

#### destructive

CSS value for error / invalid states (default `var(--destructive)`).

**Type:** `string`

#### radius

CSS value for the corner radius used on focus rings (default `var(--radius)`).

**Type:** `string`