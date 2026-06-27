import { test, expect } from "bun:test";
import { analyzeComposition, type Metric } from "../src/analyze";

const count = (src: string, metric: Metric, opts = {}) => analyzeComposition(src, opts).filter((v) => v.metric === metric).length;

const PAGE = (frontmatter: string, body: string) => `---\n${frontmatter}\n---\n${body}`;

test("a composition-only page (only PascalCase components) yields no violations", () => {
  const src = PAGE(`import Layout from "@/Layout.astro";\nconst title = "Home";`, `<Layout><HeroSection /><ToolsSection /></Layout>`);
  expect(analyzeComposition(src)).toEqual([]);
});

test("native HTML elements are flagged (and the framework ignore-set is not)", () => {
  const src = PAGE("", `<div><slot /><h1>hi</h1><p>x</p></div>`);
  expect(count(src, "native")).toBe(3); // div, h1, p — slot is ignored
  expect(analyzeComposition(src).find((v) => v.metric === "native")?.data.tag).toBe("div");
});

test("<script>, <style> and inline handlers are each flagged", () => {
  const src = PAGE("", `<button onClick={x}>go</button>\n<script>var a=1</script>\n<style>.x{}</style>`);
  expect(count(src, "handler")).toBe(1);
  expect(count(src, "script")).toBe(1);
  expect(count(src, "style")).toBe(1);
});

test("frontmatter logic is flagged; plain const/import is not", () => {
  expect(count(PAGE(`const items = data.map((x) => x);`, `<X />`), "frontmatter")).toBe(2); // .map( and =>
  expect(count(PAGE(`import X from "./X";\nconst title = "t";`, `<X />`), "frontmatter")).toBe(0);
});

test("getStaticPaths is exempt by default (page-bound), but counted when allowGetStaticPaths:false", () => {
  const src = PAGE(`export function getStaticPaths() {\n  return PAIRS.map((p) => ({ params: { p } }));\n}\nconst { p } = Astro.props;`, `<X />`);
  expect(count(src, "frontmatter")).toBe(0); // default: masked
  expect(count(src, "frontmatter", { allowGetStaticPaths: false })).toBeGreaterThan(0); // function + .map + =>
});

test("comments are masked — a <div> inside a comment is not a violation", () => {
  expect(count(PAGE("", `<!-- <div> in a comment --><X />`), "native")).toBe(0);
});

test("budgets: a metric is reported only beyond its budget", () => {
  const src = PAGE("", `<a/><a/><a/>`); // 3 native
  expect(count(src, "native")).toBe(3); // budget 0 → all
  expect(count(src, "native", { budgets: { native: 2 } })).toBe(1); // budget 2 → 1 over
  expect(count(src, "native", { budgets: { native: 5 } })).toBe(0); // under budget → none
});

test("violations carry an accurate source index (start of the offending token)", () => {
  const src = PAGE("", `<div>`);
  const v = analyzeComposition(src)[0];
  expect(src.slice(v!.index, v!.index + v!.length)).toBe("<div");
});
