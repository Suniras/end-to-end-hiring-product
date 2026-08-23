<!-- source: https://readme.paradox.ai/.well-known/agent-skills/index.json, https://readme.paradox.ai/.well-known/agent-skills/read-the-docs/SKILL.md, https://readme.paradox.ai/mcp, https://readme.paradox.ai/.well-known/oauth-protected-resource/mcp · captured_at: 2026-08-09 · method: bundle-string-mine / direct-probe -->

# Paradox — MCP / Agent-Tool Surface

**Finding: an MCP endpoint exists at `https://readme.paradox.ai/mcp`, but it is a ReadMe.io PLATFORM
feature, not something Paradox built.** Attribute it correctly — do not read this as "Paradox ships an
MCP server for its hiring API."

## What's actually there

1. **Agent-skills discovery manifest** — `GET /.well-known/agent-skills/index.json` (200, no auth):
   ```json
   {"$schema":"https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    "skills":[{"name":"read-the-docs","type":"skill-md",
      "description":"Guide to the documentation available at https://readme.paradox.ai. Points to an llms.txt summary with links to every doc, reference, changelog, and custom page.",
      "url":"https://readme.paradox.ai/.well-known/agent-skills/read-the-docs/SKILL.md", "digest":"sha256:..."}]}
   ```
   The referenced `SKILL.md` is a one-line redirector: "Fetch https://readme.paradox.ai/llms.txt for an
   index of every doc... then follow the links." This is ReadMe.io's generic `llms.txt`-discovery
   boilerplate, auto-generated for every project hosted on their platform — the `agentskills.io` schema
   and the generic wording confirm it's a platform-level feature, not Paradox-authored content.

2. **A real MCP (Model Context Protocol) endpoint** — `readme.paradox.ai/mcp`:
   - `GET` (no `Accept: text/event-stream` distinction observed) → `200 text/html`, body `"This URL can
     only be accessed with a MCP client."`
   - `POST` a JSON-RPC 2.0 `initialize` call (no auth) → `401`, body
     `{"jsonrpc":"2.0","error":{"code":-32001,"message":"Authorization required"},"id":null}` — a
     standard MCP streamable-HTTP auth-gated response (per `tradecraft.md`'s unauth-MCP-probe recipe).
   - CORS is wide open: `access-control-allow-origin: *`, custom headers
     `x-readme-conversation-id, x-readme-user-id, x-readme-project-id, x-readme-message-id,
     x-readme-ai-metadata` — these `x-readme-*` header names are ReadMe.io's own AI-assistant plumbing,
     confirming this MCP server is ReadMe's "Ask AI" / docs-chat feature exposed as an MCP tool, not a
     Paradox-authored tool surface.
   - **OAuth discovery** — `GET /.well-known/oauth-protected-resource/mcp` (200, no auth):
     ```json
     {"resource":"https://readme.paradox.ai/mcp","authorization_servers":["https://dash.readme.com/oidc"]}
     ```
     The authorization server is **`dash.readme.com`** — ReadMe's own SaaS-account OIDC issuer, entirely
     separate from Paradox's own `client_credentials` API auth (`api.paradox.ai/api/v1/public/auth/token`).
     This MCP surface authenticates a *ReadMe.com dashboard user* (a Paradox docs editor/admin), not a
     Paradox API customer — it almost certainly exposes a "search/ask this docs site" tool to an AI
     client, not a bridge to the actual Candidates/Users/Locations API.

## Conclusion

No Paradox-specific MCP server, function-calling tool schema, or "actions" file was found anywhere
(`api.paradox.ai`, `www.paradox.ai`, `olivia.paradox.ai` all 404 on every MCP/agent-manifest well-known
path probed). The one MCP endpoint that does exist is a **ReadMe.io platform capability that ships free
with every ReadMe-hosted docs site in 2026** — high-signal about the documentation *platform* Paradox
uses, not about Paradox's own product-integration surface. Recorded here per the api-dimension contract
(an MCP tool list is an API-catalog concern) but should not be cited as "Paradox has agent tooling."
