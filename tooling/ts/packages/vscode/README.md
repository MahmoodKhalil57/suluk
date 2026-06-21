<p align="center">
  <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="380" />
</p>

# Suluk — OpenAPI v4 (Candidate)

The unifying cockpit for the **Suluk** declarative cycle: author one OpenAPI v4 "Suluk"
candidate source and drive the whole loop from inside VS Code.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

This is a VS Code **extension** (`MahmoodKhalil.suluk-vscode`), not a `bun add` library. Install it
from the Extensions view (`Ctrl+Shift+X` → search **Suluk**), or build + run it from source:

```sh
bun install
bun run build          # bundles src/extension.ts → dist/extension.js
```

Then press `F5` in VS Code to launch the Extension Development Host, or package it with `vsce package`
and install the resulting `.vsix`. On activation a **Suluk** container appears in the activity bar.

## Features

- **Validate** a v4 document against the candidate meta-schema.
- **Audit** documentation coverage.
- **Preview** the contract rendered with Scalar or Swagger UI.
- **View as** different principal scopes (per-viewer docs).
- **Generate** a shadcn form/table, a Nano Stores client, or a full app (backend + frontend)
  from one v4 source.
- **Run contract checks**, export the v4 document, export the shadcn registry.
- **Deploy to Cloudflare** (Workers + D1 + static assets).

## Getting started

Open the Command Palette and run **Suluk: Open a sample API**, or open a `.yaml`/`.json` file whose
`openapi:` starts with `4`. The **Suluk** activity-bar container then lights up with three views:

- **Cycle** — every layer of the contract (data · contract · auth · docs · state · UI · cost · tests),
  each row offering the command that acts on it (validate, preview, generate, …).
- **Builder** — composes a full stack from your entities (pages → sections → blocks → components) and
  generates the app + a shadcn registry.
- **Environments** — registered deployments; connect to load a live contract, diff against local,
  open the live cost ledger / app / Scalar docs.

## Commands

Open the Command Palette and type **Suluk:** to see every command. Highlights: **Validate v4 document**,
**Audit documentation coverage**, **Preview in Scalar / Swagger UI**, **View as (principal scopes)**,
**Generate shadcn form/table**, **Generate Nano Stores client**, **Generate full app**,
**Run contract checks**, **Export v4 document / shadcn registry**, **Converge (coherence audit)**,
**Ship readiness checklist**, and **Deploy to Cloudflare**.

## Requirements

VS Code `^1.85.0`. The extension's brain is the `@suluk/cockpit`, `@suluk/core`, `@suluk/models`, and
`@suluk/agents` packages — it *renders and generates* from a v4 contract; it never hosts the running app.

## License

Apache-2.0.
