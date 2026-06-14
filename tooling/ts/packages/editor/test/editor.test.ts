import { test, expect, describe } from "bun:test";
import { validateDocument } from "@suluk/core";
import { editorHtml, examples, defaultExample } from "../src/index";
import { analyze, serialize, parseSource } from "../src/client/analyze";
import { encodeShare, decodeShare } from "../src/client/codec";

describe("editorHtml — the self-contained shell", () => {
  const html = editorHtml();
  test("is one complete HTML document", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("OpenAPI v4 editor");
  });
  test("wires every DOM id the client binds to", () => {
    for (const id of ["suluk-src", "suluk-preview", "suluk-status", "suluk-grade", "suluk-diag", "suluk-examples", "suluk-fmt-json", "suluk-fmt-yaml", "suluk-upgrade", "suluk-downgrade", "suluk-share", "suluk-modal", "suluk-modal-body", "suluk-toast"]) {
      expect(html).toContain(`id="${id}"`);
    }
  });
  test("loads the fork bundle THEN the client module, and injects config", () => {
    const fork = html.indexOf("/vendor/scalar/standalone-suluk.js");
    const client = html.indexOf('type="module" src="/editor.client.js"');
    expect(fork).toBeGreaterThan(0);
    expect(client).toBeGreaterThan(fork); // fork (defines window.Scalar) must load first
    expect(html).toContain("window.__SULUK_EDITOR__=");
  });
  test("respects overrides", () => {
    const h = editorHtml({ brand: "Acme", forkSrc: "/f.js", clientSrc: "/c.js" });
    expect(h).toContain("Acme");
    expect(h).toContain('src="/f.js"');
    expect(h).toContain('type="module" src="/c.js"');
  });
  test("neutralizes </script> in the injected config (no markup break-out)", () => {
    const h = editorHtml({ initialDoc: { openapi: "4.0.0-candidate", info: { title: "</script><b>x", version: "1" }, paths: {} } });
    expect(h).not.toContain("</script><b>x");
  });
});

describe("seed examples", () => {
  test("the v4 examples validate as v4 documents", () => {
    for (const ex of examples.filter((e) => e.id !== "openapi31")) {
      const r = validateDocument(ex.doc);
      expect(r.valid).toBe(true);
    }
  });
  test("Suluk Galaxy is the default and puts two requests on one POST path (the v4 headline)", () => {
    expect(defaultExample.id).toBe("galaxy");
    const checkout = (defaultExample.doc as { paths: Record<string, { requests: Record<string, { method: string }> }> }).paths.checkout;
    const posts = Object.values(checkout.requests).filter((r) => r.method === "post");
    expect(posts.length).toBe(2); // guestCheckout + memberCheckout — impossible to express in 3.1
  });
});

describe("analyze — the browser-safe analysis core", () => {
  const galaxyJson = JSON.stringify(defaultExample.doc);
  test("valid v4 → parseOk, valid, a hardening grade, no issues", () => {
    const a = analyze(galaxyJson, "json");
    expect(a.parseOk).toBe(true);
    expect(a.valid).toBe(true);
    expect(a.major).toBe("4");
    expect(a.grade).toBeTruthy();
    expect(a.issues.length).toBe(0);
  });
  test("broken JSON → a single parse issue with a source offset", () => {
    const a = analyze('{ "openapi": ', "json");
    expect(a.parseOk).toBe(false);
    expect(a.doc).toBeNull();
    expect(a.issues.length).toBe(1);
    expect(a.issues[0].severity).toBe("error");
  });
  test("invalid v4 (wrong shape) → validation issues with paths", () => {
    const a = analyze(JSON.stringify({ openapi: "4.0.0-candidate", info: { title: "x" } }), "json"); // missing version + paths
    expect(a.parseOk).toBe(true);
    expect(a.valid).toBe(false);
    expect(a.issues.length).toBeGreaterThan(0);
  });
  test("detects an OpenAPI 3.1 document (so the UI can offer upgrade)", () => {
    const oas31 = examples.find((e) => e.id === "openapi31")!.doc;
    const a = analyze(JSON.stringify(oas31), "json");
    expect(a.major).toBe("3");
  });
  test("parses YAML too", () => {
    const yamlText = serialize(defaultExample.doc, "yaml");
    const a = analyze(yamlText, "yaml");
    expect(a.valid).toBe(true);
  });
});

describe("serialize round-trips through both formats", () => {
  test("json ⇄ object", () => {
    expect(parseSource(serialize(defaultExample.doc, "json"), "json").doc).toEqual(defaultExample.doc);
  });
  test("yaml ⇄ object", () => {
    expect(parseSource(serialize(defaultExample.doc, "yaml"), "yaml").doc).toEqual(defaultExample.doc);
  });
});

describe("share codec round-trips through the URL hash", () => {
  test("encode → decode recovers text + format", async () => {
    const text = JSON.stringify(defaultExample.doc, null, 2);
    const frag = await encodeShare(text, "json");
    const back = await decodeShare("#" + frag);
    expect(back).not.toBeNull();
    expect(back!.format).toBe("json");
    expect(back!.text).toBe(text);
  });
  test("an unrelated hash decodes to null", async () => {
    expect(await decodeShare("#description/introduction")).toBeNull();
  });
});
