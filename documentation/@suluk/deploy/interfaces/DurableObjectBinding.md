[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / DurableObjectBinding

# Interface: DurableObjectBinding

Defined in: [types.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/deploy/src/types.ts#L20)

A Durable Object class to bind + migrate. The Cloudflare Agents SDK runs each agent as a SQLite-backed Durable
Object, so a deploy that ships agents must emit BOTH a `durable_objects.bindings` entry AND a `migrations` entry
that creates the class. `@suluk/deploy` stays decoupled from the agent contract: the CALLER (the cockpit, or
`@suluk/agents`' future `projectCloudflareAgent`) computes which agents are Durable Objects and passes them here.

## Properties

### binding

> **binding**: `string`

Defined in: [types.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/deploy/src/types.ts#L22)

the binding name exposed as `env.<binding>` (e.g. "WeatherAssistant").

***

### className

> **className**: `string`

Defined in: [types.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/deploy/src/types.ts#L24)

the exported Agent/DO class name (`class WeatherAssistant extends Agent {…}`).

***

### scriptName?

> `optional` **scriptName?**: `string`

Defined in: [types.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/deploy/src/types.ts#L28)

cross-script DO: the script that DEFINES the class. Omit for a same-script class (the only kind we migrate).

***

### sqlite?

> `optional` **sqlite?**: `boolean`

Defined in: [types.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/deploy/src/types.ts#L26)

SQLite-backed storage — REQUIRED by the Agents SDK and the Workers free plan. Default true ⇒ `new_sqlite_classes`.
