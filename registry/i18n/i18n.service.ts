/**
 * The i18n service (Suluk registry: `i18n`) — locale/direction negotiation over `@suluk/i18n` (the q-weighted
 * `Accept-Language` matcher, the cookie parser, and the config/direction model all stay upstream, so a fix flows via
 * npm). THIS layer is the owned wiring: the app's DEFAULT locale set (edit `LOCALES` to declare your locales) plus a Hono
 * middleware that resolves each request's locale — a `?lang` query wins, then the `locale` cookie, then `Accept-Language`
 * — and stashes `locale` + `dir` on the context for downstream handlers. i18n is a STATELESS binding (no DB/provision) per
 * the C052 boundary. Keep the negotiation in `@suluk/i18n`; the middleware is just the plumbing.
 */
import type { Hono, MiddlewareHandler } from "hono";
import {
  defineLocales,
  resolveLocale,
  negotiateLocale,
  dirOf,
  readCookie,
  isSupportedLocale,
  type LocaleConfig,
  type Direction,
} from "@suluk/i18n";
import type { Bindings } from "../app";

/**
 * The app's locale set — EDIT THIS to declare your locales (code + label + direction). Shipped with English (ltr) and
 * Arabic (rtl, Eastern-Arabic numerals) as a bilingual starting point; `default` is the fallback every request lands on
 * when nothing negotiates.
 */
export const LOCALES: LocaleConfig = defineLocales({
  locales: [
    { code: "en", label: "English", dir: "ltr" },
    { code: "ar", label: "العربية", dir: "rtl", numberingSystem: "arab" },
  ],
  default: "en",
});

/** What the middleware stashes on the Hono context (read them with `c.get("locale")` / `c.get("dir")`). */
export type I18nVars = { locale: string; dir: Direction };

/** The name of the query param + cookie an explicit override is read from. */
const OVERRIDE_KEY = "lang";
const COOKIE_NAME = "locale";

/**
 * Build the locale-negotiation middleware for a given locale set. Precedence: a `?lang=` query override wins (if it names
 * a supported locale), then the `locale` cookie, then a q-weighted `Accept-Language` match — falling back to the config
 * default. Sets `c.set("locale", code)` and `c.set("dir", "ltr"|"rtl")`. The matching itself lives in `@suluk/i18n`.
 */
export function localeMiddleware(config: LocaleConfig = LOCALES): MiddlewareHandler {
  return async (c, next) => {
    const query = c.req.query(OVERRIDE_KEY);
    const cookie = readCookie(c.req.header("cookie"), COOKIE_NAME);

    let code: string;
    if (isSupportedLocale(config, query)) {
      code = resolveLocale(config, query);
    } else if (isSupportedLocale(config, cookie)) {
      code = resolveLocale(config, cookie);
    } else {
      code = negotiateLocale(config, c.req.header("accept-language"));
    }

    c.set("locale", code);
    c.set("dir", dirOf(config, code));
    await next();
  };
}

/**
 * Apply locale/direction negotiation to EVERY request — the global-middleware mount the generated entry calls as
 * `mountI18n(app)` (a cross-cutting concern). After it runs, every downstream handler can read `c.get("locale")` +
 * `c.get("dir")`. Edit {@link LOCALES} to declare your locale set.
 */
export function mountI18n<T extends Hono<{ Bindings: Bindings }>>(app: T, config: LocaleConfig = LOCALES): T {
  app.use("*", localeMiddleware(config));
  return app;
}
