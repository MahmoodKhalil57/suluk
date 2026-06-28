/**
 * Deterministic text normalization shared by the vocabulary projector and the binder.
 *
 * The wall (C038 / D1): `norm` produces the matching SKELETON used to decide a BIND — it strips slot VALUES
 * (numbers, $amounts, quoted strings, `<placeholders>`) to a `*` token so a step's literal data never enters the
 * decision. `tok`/`jaccard` are used ONLY in the presentational tri-state classifier ("did you mean?"), never to
 * decide a bind. No lemmatization, stemming, or embedding anywhere — pure, local, statically decidable.
 */

/** camelCase / snake_case / kebab → lower-case space-separated words. `getAutoTopup` → "get auto topup". */
export function camel(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .trim();
}

/** The matching skeleton: lower-cased, punctuation-flattened, slot-VALUES collapsed to `*`, whitespace-collapsed. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/["'`.]/g, " ")
    .replace(/<[^>]+>/g, " * ") // <slot>
    .replace(/\$?\b\d[\d,.]*\b/g, " * ") // numbers / $amounts → slot
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set("i a an the my me of to is are for and it as on with you your".split(" "));

/** Content tokens for the presentational similarity classifier (stopwords + slots removed). */
export function tok(s: string): string[] {
  return norm(s)
    .split(" ")
    .filter((w) => w && w !== "*" && !STOP.has(w));
}

/** Jaccard overlap of two token bags — presentational ranking only. */
export function jaccard(a: string[], b: string[]): number {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}
