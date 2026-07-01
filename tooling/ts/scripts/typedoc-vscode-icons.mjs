// TypeDoc plugin — re-skin the icon set with VS Code icons (the icones collection).
//
// Two families, chosen per slot:
//   • Reflection KINDS (Class, Interface, Function, …) → codicon `symbol-*` glyphs — VS Code's own
//     code-symbol icons (what its Outline / breadcrumbs draw), tinted with TypeDoc's existing per-kind
//     `--color-ts-*` variables so the color-as-kind signal survives in both light and dark.
//   • FOLDERS / modules + the toolbar chrome → the colourful `vscode-icons` file-explorer set / codicon.
//
// Mechanism (verified against typedoc@0.28.19 source): the icon set is an object of `() => <svg>` builders
// living on the *theme* instance (`DefaultThemeRenderContext` builds sprite references from `theme.icons`;
// its docstring: "to customize icons, that object must be modified instead"). The theme is instantiated in
// `Renderer.prepareTheme()` (renderer.js) immediately BEFORE `RendererEvent.BEGIN` fires and before the
// `assets/icons.svg` sprite is written — so mutating `app.renderer.theme.icons` at BEGIN is the safe seam.
// `buildRefIcons` asserts each builder returns a top-level `<svg>` (so we never wrap it) and special-cases
// `checkbox` (so we never touch it).
import { JSX, ReflectionKind, RendererEvent } from "typedoc";
import { icons as vscodeIcons } from "@iconify-json/vscode-icons";
import { icons as codicons } from "@iconify-json/codicon";
import { getIconData, iconToSVG, replaceIDs } from "@iconify/utils";

/** Build a `() => <svg>` icon builder from an Iconify set. `props` are merged onto the <svg> element. */
function iconify(set, name, props = {}) {
  const data = getIconData(set, name);
  if (!data) throw new Error(`typedoc-vscode-icons: icon "${name}" not found in the Iconify set`);
  const { body, attributes } = iconToSVG(data, { height: "auto" });
  // replaceIDs() rewrites internal ids/gradients so multiple colourful icons in one sprite can't collide.
  return () =>
    JSX.createElement(
      "svg",
      { viewBox: attributes.viewBox, "aria-hidden": "true", ...props },
      JSX.createElement(JSX.Raw, { html: replaceIDs(body) }),
    );
}

/** A colourful vscode-icons glyph (carries its own fills — no tint, reads the same in any theme). */
const vsc = (name, props) => iconify(vscodeIcons, name, props);
/**
 * A codicon symbol glyph tinted to a TypeDoc kind colour. codicon bodies pin `fill="currentColor"`,
 * and `currentColor` follows the CSS `color` property — which cascades through `<use>` into the sprite's
 * shadow tree — so we tint via `style="color:…"`, NOT `fill` (a `fill` on the reference is ignored).
 */
const sym = (name, colorVar) =>
  iconify(codicons, name, { class: "tsd-kind-icon", style: `color:var(${colorVar})` });

export function load(app) {
  app.renderer.on(RendererEvent.BEGIN, () => {
    const icons = app.renderer.theme?.icons;
    if (!icons) return; // defensive: theme not prepared (should never happen at BEGIN)

    Object.assign(icons, {
      // ── reflection kinds → codicon symbol-* glyphs, tinted with TypeDoc's own --color-ts-* vars ──
      [ReflectionKind.Class]: sym("symbol-class", "--color-ts-class"),
      [ReflectionKind.Interface]: sym("symbol-interface", "--color-ts-interface"),
      [ReflectionKind.Function]: sym("symbol-method", "--color-ts-function"),
      [ReflectionKind.Method]: sym("symbol-method", "--color-ts-method"),
      [ReflectionKind.Constructor]: sym("symbol-method", "--color-ts-constructor"),
      [ReflectionKind.Variable]: sym("symbol-variable", "--color-ts-variable"),
      [ReflectionKind.Property]: sym("symbol-field", "--color-ts-property"),
      [ReflectionKind.Accessor]: sym("symbol-property", "--color-ts-accessor"),
      [ReflectionKind.Enum]: sym("symbol-enum", "--color-ts-enum"),
      [ReflectionKind.EnumMember]: sym("symbol-enum-member", "--color-ts-enum-member"),
      [ReflectionKind.TypeAlias]: sym("symbol-structure", "--color-ts-type-alias"),
      [ReflectionKind.TypeParameter]: sym("symbol-parameter", "--color-ts-type-parameter"),
      [ReflectionKind.Namespace]: sym("symbol-namespace", "--color-ts-namespace"),
      [ReflectionKind.Reference]: sym("references", "--color-ts-reference"),

      // ── modules (= packages here) & folders → the colourful vscode-icons file-explorer look ──
      [ReflectionKind.Module]: vsc("default-folder", { class: "tsd-kind-icon" }),
      folder: vsc("default-folder", { class: "tsd-kind-icon" }),

      // ── document nav (the umbrella's guides/spec/packages tree) → a VS Code file-explorer look ──
      [ReflectionKind.Document]: vsc("file-type-markdown", { class: "tsd-kind-icon" }), // a leaf .md page
      package: vsc("file-type-npm", { class: "tsd-kind-icon" }), // a package entry (see getReflectionIcon patch)

      // ── toolbar chrome → codicon, tinted to the toolbar icon colour (via `color`, see sym() note) ──
      search: iconify(codicons, "search", { style: "color:var(--color-icon-text)", width: "16", height: "16" }),
      menu: iconify(codicons, "menu", { style: "color:var(--color-icon-text)", width: "16", height: "16" }),
    });

    // A node's nav icon is `icon || kind`; `icon` is set only when getReflectionIcon(el) !== el.kind. So patch
    // getReflectionIcon to give DOCUMENT nodes a file-explorer treatment: a documents-FOLDER (a doc with child
    // docs) → the folder glyph; a package entry (a doc whose title is a `@suluk/*` name) → the npm glyph; every
    // other leaf document falls through to the Document kind → the markdown glyph set above.
    const theme = app.renderer.theme;
    if (theme && !theme.__sulukIconPatch) {
      theme.__sulukIconPatch = true;
      const original = theme.getReflectionIcon.bind(theme);
      theme.getReflectionIcon = (reflection) => {
        if (reflection && typeof reflection.isDocument === "function" && reflection.isDocument()) {
          if (reflection.children && reflection.children.length) return "folder";
          if (typeof reflection.name === "string" && reflection.name.startsWith("@suluk/")) return "package";
        }
        return original(reflection);
      };
    }
  });
}
