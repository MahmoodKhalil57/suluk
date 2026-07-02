# Configuration

## MountErasureOptions

### Properties

#### extraSteps

wired from platform.config.ts: the COMPOSED per-module erase-steps (`erasure.cascade → <module>.eraseStep`, fan-in).
 Omit → the empty cascade (a subset with no installed data modules, or a manual/hand-written cascade).

**Type:** `any`