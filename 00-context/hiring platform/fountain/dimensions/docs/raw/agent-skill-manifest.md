<!-- source: developer.fountain.com/.well-known/agent-skills/index.json + .../read-the-docs/SKILL.md · captured_at: 2026-08-09 · method: crawl-clip -->

# The agent-skill discovery manifest — a genuinely novel, early-adopter pattern

This is distinct from a normal docs crawl and worth flagging on its own for the api/website dimensions
to cross-check.

## `https://developer.fountain.com/.well-known/agent-skills/index.json`

Verbatim (schema: `schemas.agentskills.io/discovery/0.2.0`):

```json
{
  "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  "skills": [
    {
      "name": "read-the-docs",
      "type": "skill-md",
      "description": "Guide to the documentation available at https://developer.fountain.com. Points to an llms.txt summary with links to every doc, reference, changelog, and custom page.",
      "url": "https://developer.fountain.com/.well-known/agent-skills/read-the-docs/SKILL.md",
      "digest": "sha256:4e6b76e8c85bc85a84bc57722c4e9056438a7bda9718c20df5d504f0c5cdb1fe"
    }
  ]
}
```

## `https://developer.fountain.com/.well-known/agent-skills/read-the-docs/SKILL.md`

Verbatim:

```markdown
---
name: read-the-docs
description: "Guide to the documentation available at https://developer.fountain.com. Points to an llms.txt summary with links to every doc, reference, changelog, and custom page."
---

Fetch https://developer.fountain.com/llms.txt for an index of every doc, API reference, changelog entry,
and custom page on this site, then follow the links in it to read the pages you need.
```

## What this is (and isn't)

- **`schemas.agentskills.io`** is a discovery-manifest schema for **agent skills** (a pattern for letting
  an AI agent self-discover "skills" it can load — analogous in spirit to Anthropic's Claude "Skills"
  concept and the emerging `.well-known` convention for machine-actionable site metadata, alongside
  `llms.txt` and MCP). This is **not** an MCP server manifest and **not** a function-calling tool schema
  — it's a documentation-discovery pointer, one level up from an MCP tool catalog: it tells an agent
  *where to look* (llms.txt), not what to *call* (that's the separate `exposeAsMcpTool`-tagged OpenAPI
  operations noted in raw/api-reference.md).
- The one registered skill (`read-the-docs`) is itself trivial — its entire content is "go fetch
  llms.txt and follow the links," i.e. this manifest exists to bootstrap discovery of the
  already-existing llms.txt, not to expose any novel capability beyond that.
- **Note the actual llms.txt content does NOT include a changelog** despite the skill description
  explicitly promising one ("links to every doc, reference, **changelog**, and custom page") — the
  593-page llms.txt index (see raw/doc-map.md) contains zero changelog entries. This is a minor
  description/reality mismatch: either a changelog exists but isn't currently linked from llms.txt, or
  the SKILL.md description is aspirational/stale. Flagged as an open question for the `community`
  dimension to cross-check (a Fountain product changelog may exist elsewhere, e.g. a ReadMe "Updates"
  page not surfaced in this llms.txt).

## Why this matters for a product-strategy read

Fountain (a mid-market/enterprise vertical-SaaS hiring platform, not a developer-tools company) has
proactively adopted **two separate emerging agent-interoperability conventions** (`.well-known/
agent-skills` + `llms.txt`) on its developer-docs subdomain, ahead of many larger platform companies.
Combined with the `exposeAsMcpTool` OpenAPI tag found in api-reference.md, this is a genuine, concrete
signal that Fountain's platform/developer-experience team is investing in **agent-consumable
integration surfaces** as a forward-looking bet — not just marketing copy about "AI agents" (Anna/Emma/
Sam/Cue) but real infrastructure-level agent-interoperability plumbing on the docs/API side. This is a
different (and more concrete) kind of "AI-native" evidence than the customer-facing agent-persona
marketing, and worth flagging to evaluation as independent corroboration in the AI-investment direction,
even though it doesn't confirm anything about the customer-facing agents' actual architecture.
