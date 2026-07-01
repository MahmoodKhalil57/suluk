#!/usr/bin/env bun
/**
 * The @suluk/provision CLI shell (C047) — drizzle-kit-style. Loads `provision.config.ts` (its default export is a
 * {@link ProvisionApp}), runs the command, prints, and exits. All logic is in `runCli` (pure of the process); this is
 * only the I/O edge.
 *
 *   provision plan            diff the desired config against the live journal
 *   provision apply [--prune] provision + bind + land credentials (push)
 *   provision check           fail (exit 1) on any drift — the CI gate
 *   provision status          show what's provisioned
 *   --config <path>           the config file (default ./provision.config.ts)
 */
import { resolve } from "node:path";
import { runCli } from "../src/cli";
import type { ProvisionApp } from "../src/app";

const argv = process.argv.slice(2);
const ci = argv.indexOf("--config");
const configPath = ci >= 0 ? argv[ci + 1] : "provision.config.ts";
const args = argv.filter((a, i) => a !== "--config" && i !== ci + 1);

const mod = (await import(resolve(process.cwd(), configPath))) as { default?: ProvisionApp };
if (!mod.default) {
  console.error(`✗ ${configPath} has no default export (expected a defineProvisionApp(...) result)`);
  process.exit(2);
}

const { output, exitCode } = await runCli(mod.default, args);
console.log(output);
process.exit(exitCode);
