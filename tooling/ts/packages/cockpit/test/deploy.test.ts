import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument } from "@suluk/core";
import { deployPlan, deployMarkdown } from "../src/deploy";

const petstore = parseDocument(
  readFileSync(join(import.meta.dir, "..", "..", "core", "test", "conformance", "valid", "01-petstore.yaml"), "utf8"),
);

describe("deployPlan — the cockpit's Cloudflare deploy surface (API flow)", () => {
  const plan = deployPlan(petstore);

  test("is the one-command API deploy — no wrangler, no generated infra files", () => {
    expect(plan.provider).toBe("cloudflare");
    expect(plan.files).toEqual([]); // the generator already ships scripts/deploy.ts — nothing for the host to write
    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0].cmd).toBe("bun run deploy");
  });

  test("the notes explain the API flow + the .env-decrypted credentials (never wrangler login)", () => {
    const notes = plan.notes.join(" ");
    expect(notes).toContain("REST API");
    expect(notes).toContain("CLOUDFLARE_API_TOKEN");
    expect(notes).toContain("decrypted `.env`");
    expect(notes).toContain("no wrangler CLI"); // the flow is wrangler-free (the note says so explicitly)
  });

  test("deployMarkdown renders a followable DEPLOY.md (API-driven)", () => {
    const md = deployMarkdown(plan);
    expect(md).toContain("# Deploy to Cloudflare");
    expect(md).toContain("bun run deploy");
    expect(md).toContain("no wrangler");
    expect(md).toContain("swappable");
  });
});
