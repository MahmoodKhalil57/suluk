// TypeDoc plugin — inject Suluk's favicon + Open Graph / Twitter card meta into EVERY page's <head>.
//
// The default TypeDoc theme ships no social-card / favicon meta, and the previous bespoke site wired these
// with a flat, top-level-only post-processor (branding/.render/inject-head.ts — it never reached nested
// pages). A `head.end` render hook fixes both: it runs for every rendered page (landing, guides, and the
// deep API-reference tree alike), so the social card + favicon are consistent site-wide. og:/twitter:title
// is per-page (`context.page.model.name`) so a shared link previews with the page it points at.
import { JSX } from "typedoc";

const BRAND = "https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export";
const DESCRIPTION =
  "One typed OpenAPI v4 contract, projected into every full-stack layer — API, docs, typed client, UI, tests, admin, and deploy.";

export function load(app) {
  app.renderer.hooks.on("head.end", (context) => {
    const name = context?.page?.model?.name;
    const title = name && name !== "Suluk" ? `${name} · Suluk` : "Suluk";
    return JSX.createElement(
      JSX.Fragment,
      null,
      // favicons (served from the committed branding export via raw.githubusercontent)
      JSX.createElement("link", { rel: "icon", type: "image/svg+xml", href: `${BRAND}/favicon.svg` }),
      JSX.createElement("link", { rel: "icon", type: "image/png", sizes: "32x32", href: `${BRAND}/icon-32.png` }),
      JSX.createElement("link", { rel: "apple-touch-icon", href: `${BRAND}/apple-touch-icon.png` }),
      // description + Open Graph
      JSX.createElement("meta", { name: "description", content: DESCRIPTION }),
      JSX.createElement("meta", { property: "og:type", content: "website" }),
      JSX.createElement("meta", { property: "og:site_name", content: "Suluk" }),
      JSX.createElement("meta", { property: "og:title", content: title }),
      JSX.createElement("meta", { property: "og:description", content: DESCRIPTION }),
      JSX.createElement("meta", { property: "og:image", content: `${BRAND}/social-card.png` }),
      // Twitter card
      JSX.createElement("meta", { name: "twitter:card", content: "summary_large_image" }),
      JSX.createElement("meta", { name: "twitter:title", content: title }),
      JSX.createElement("meta", { name: "twitter:description", content: DESCRIPTION }),
      JSX.createElement("meta", { name: "twitter:image", content: `${BRAND}/social-card.png` }),
    );
  });
}
