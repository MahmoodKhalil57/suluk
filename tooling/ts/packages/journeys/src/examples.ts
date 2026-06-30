/**
 * Example precedence + origin-aware synthesis. The implementation moved to the shared zero-dep leaf `@suluk/examples`
 * (so `@suluk/sdk` can read it too — journeys depends on sdk, so the reader had to sit below both). journeys keeps this
 * re-export so its public API and the projector-core wall (which forbids importing this VALUE layer) are unchanged.
 */
export * from "@suluk/examples";
