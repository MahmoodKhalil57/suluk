---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-logs
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Quick Reference

**logs.routes:** `logsRoutes`
**logs.service:** `Logs`, `LogEntry`, `LogQuery` (A small, SAFE filter over the activity log (the Activity/query surface)), `LogBucket` (One bucket of a coarse action-count timeseries (count of matching rows per distinct `action`)), `LogsLive`
**logs.schema:** `activityLog`
**logs.provision:** `logsProvision`
**logs.contract:** `logsOps`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`