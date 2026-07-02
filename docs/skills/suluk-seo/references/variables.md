# Variables & Constants

## skew

### `DEPLOYMENT_HEADER`
Deploy skew-protection — pin a client to the deployment it loaded, and force a full reload after a new deploy
 (so a long-lived tab never runs old HTML against freshly-rotated chunks / a changed contract).

 Server: stamp `deploymentMeta(id)` into <head>, and return the same id in the `x-deployment-id` response header
 from a light endpoint (e.g. /api/health). Client: include `skewGuardScript()` once — it polls that header and,
 on a mismatch, does a hard navigation on the next same-origin link click.
```ts
const DEPLOYMENT_HEADER: "x-deployment-id"
```
