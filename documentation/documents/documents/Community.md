[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / [Guides](../Guides.md) / Community

# Community

Suluk is meant to be **extended and built upon**. Here is where that happens.

## Talk about it

- [Discussions](https://github.com/MahmoodKhalil57/suluk/discussions) — questions, ideas, show-and-tell.
- [Issues](https://github.com/MahmoodKhalil57/suluk/issues) — bugs and concrete proposals.

## Build community libraries

The whole stack ships in shadcn's **registry** format, which means *anything* — frontend components AND
backend slices — can be distributed as an installable unit. `@suluk/builder`'s `toShadcnRegistry` turns a
slice into a registry item bundling its UI **and** its routes **and** its schema:

```sh
npx shadcn add https://your-registry.example/pet-crud.json
```

Publish your own registry (a static JSON host — even GitHub Pages) and the community can install your
full-stack slices with one command. A community library is just a registry of slices that consume the same
v4 contract.

## Extend the framework

- A new **projection** package (the v4 document → some new artifact).
- A new **DeployProvider** (the deploy target is swappable by design).
- A new **cockpit shell** — the editor and `/superadmin` are two faces of `@suluk/cockpit`; add a third.
- A new **service** in the `@suluk/platform` catalog — a typed manifest entry others can compose.

See [Contributing](Contributing.md) for the conventions, and [Architecture](Architecture.md) for the
shape of the whole thing.

> These docs were generated from the repository by `@suluk/docs` + TypeDoc and are hosted on GitHub Pages —
> the same way your fork's docs can be.
