---
description: "Suluk Agent composition (C027): lint + project an `x-suluk-agents` map (skills + deterministic routes + by-name sub-agents) to a Claude plugin AND an OpenRouter/OpenAI-compatible manifest — one contract, two artifacts, zero network at generate time. Determinism is DECLARED not enforced; the matcher never reads an agent field. CANDIDATE tooling — NOT official OAS."
name: suluk-agents
---

# @suluk/agents

Suluk Agent composition (C027): lint + project an `x-suluk-agents` map (skills + deterministic routes + by-name sub-agents) to a Claude plugin AND an OpenRouter/OpenAI-compatible manifest — one contract, two artifacts, zero network at generate time. Determinism is DECLARED not enforced; the matcher never reads an agent field. CANDIDATE tooling — NOT official OAS.

## Quick Start

```ts
import { lintAgents, lintOk, assertAgentInstallable } from "@suluk/agents";

const findings = lintAgents(doc);              // LintFinding[] — severity/code/agent/detail/at
if (!lintOk(findings)) {                        // false ⇒ at least one error-severity finding
  for (const f of findings.filter((f) => f.severity === "error")) {
    console.error(`${f.code} @ ${f.agent}.${f.at ?? ""}: ${f.detail}`);
  }
}

assertAgentInstallable(doc, "conin");           // throws if "conin" does not install (else void)
```

## Configuration

7 configuration interfaces — see references/config.md for details.

## Quick Reference

120 exports (62 functions, 52 types, 6 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → browse `references/functions/` for grouped indexes, full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)