[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/seo](../README.md) / DEPLOYMENT\_HEADER

# Variable: DEPLOYMENT\_HEADER

> `const` **DEPLOYMENT\_HEADER**: `"x-deployment-id"` = `"x-deployment-id"`

Defined in: [skew.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/seo/src/skew.ts#L8)

Deploy skew-protection — pin a client to the deployment it loaded, and force a full reload after a new deploy
 (so a long-lived tab never runs old HTML against freshly-rotated chunks / a changed contract).

 Server: stamp `deploymentMeta(id)` into <head>, and return the same id in the `x-deployment-id` response header
 from a light endpoint (e.g. /api/health). Client: include `skewGuardScript()` once — it polls that header and,
 on a mismatch, does a hard navigation on the next same-origin link click.
