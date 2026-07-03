/** Shared zod schemas for the `keys` module — the wire shapes the routes (@suluk/effect `ok.schema`) reuse, so the routes
 *  and their derived contract can never drift on the effective-caps shape. */
import { z } from "zod";

/** The caller's EFFECTIVE grant on a key — scopes ∩ + the MIN (soonest) cap/expiry up the chain. Echoed by provisionKey. */
export const EffectiveCapsSchema = z.object({
  scopes: z.array(z.string()),
  creditLimit: z.number().int().nullable(),
  rateLimitSharePct: z.number().nonnegative().nullable(),
  expiresAt: z.number().int().nullable(),
});
