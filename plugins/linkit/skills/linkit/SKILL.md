---
name: linkit
description: Publish Codex-built HTML files or static bundles as free temporary public preview links through Linkit. Use when the user wants to turn generated web output into a shareable URL or asks to publish a preview externally.
---

# Linkit

Linkit is a Codex-first public preview workflow that is currently free. Each user activates once with a one-time code, then the plugin stores a personal API key locally. Previews expire after 3 days, allow up to 10 successful publishes per UTC day, accept bundles up to 10 MB, and include a small Linkit badge with a report link.

Use `publish_auto` first when the user points at a local workspace path and you can publish directly from that path. It should be the default local Codex path because it decides between single-page and bundle mode before publishing.

Use `publish_page` for a single standalone HTML document when you already have the full HTML text in hand. Use `publish_bundle` when you already have an explicit multi-file static site payload with HTML, CSS, JS, and assets.

For local-path publishing, do not `cat` a large HTML file into the terminal, do not print base64 bundle payloads, and do not echo the full document back into the conversation just to publish it. Prefer light checks such as file extension, `wc -c`, or targeted `rg` before calling `publish_auto`.

If the user uploaded an HTML file, make sure you have the actual file contents before calling the tool. Do not invent a simplified placeholder page from the filename or a file summary.

When publishing a single HTML file, preserve the original page content. Do not compress, simplify, minify, restyle, repair, summarize, or rewrite it unless the user explicitly asks for that transformation first. The hosted preview adds Linkit's required badge and report link.

If a single HTML file exceeds the size limit because it embeds heavy media, Linkit should still preserve the main page content, omit only the heavy embedded media needed to fit the limit, and clearly label the result as a lightweight preview.

When publishing a bundle, preserve the provided files whenever they fit within the 10 MB limit. Do not flatten multiple files into one HTML page. If a local bundle exceeds the size budget because of heavy media, the local helper may omit only the heavy media files needed to fit and clearly label the result as a lightweight preview. Hosted HTML pages include Linkit's required badge and report link.

## When to use

- The user has a complete HTML document or a static build output folder and wants a shareable external preview.
- The user asks for a temporary link, preview URL, or expiring page.
- The HTML was built in Codex or is available as a local file in the workspace.
- The user says things like `@Linkit`, `publish this page`, `make this shareable`, or `give me a preview link`.

## Default local flow

- If the user gives a local file path or directory path, prefer `publish_auto`.
- For local file or directory publishing, avoid large text round-trips. Do not read the whole HTML or bundle into chat unless you actually need to inspect a small excerpt for debugging.
- `publish_auto` should classify at the start:
  - standalone HTML file with no local sibling dependencies -> page mode
  - HTML file with relative local assets or sibling page links -> bundle mode
  - directory path -> bundle mode
- If the selected page or bundle is too large because of media files, Linkit should automatically publish a lightweight review build with an omission notice instead of rewriting the main content.

## Tool contract

Call `publish_page` with:

```json
{
  "html": "<!doctype html>...</html>",
  "title": "optional title"
}
```

The tool returns:

```json
{
  "url": "https://linkit.smartgeo.tokyo/abc123def0",
  "expiresAt": "2026-05-23T12:00:00.000Z"
}
```

Call `publish_auto` with:

```json
{
  "path": "/abs/path/to/dist-or-html",
  "entryPath": "index.html"
}
```

Call `publish_bundle` with:

```json
{
  "entryPath": "index.html",
  "files": [
    {
      "path": "index.html",
      "contentBase64": "..."
    },
    {
      "path": "assets/app.js",
      "contentBase64": "..."
    }
  ],
  "title": "optional title"
}
```

## Response style

- Return the public URL prominently.
- Mention the expiration time briefly.
- State that Linkit links expire after 3 days in the current free phase; custom TTL is not available.
- Prefer a concise "here is your link" style over a long explanation.
- Treat Linkit as temporary preview infrastructure, not permanent hosting.

## Guardrails

- Only use Linkit for static preview publishing.
- Use only the user's personal Linkit API key; never share a key across users.
- Do not try to bypass the 10-publishes-per-day or 10 MB bundle limits.
- Do not use it for secrets, API keys, private keys, or other sensitive content.
- Do not call Linkit if you only know the attachment name or a prose summary of the file.
- If the user gives you multiple files or a local path, prefer `publish_auto` or `publish_bundle` over flattening everything into one HTML file.
- Do not rewrite or "optimize" user HTML or bundle files during publish. Publishing means hosting the original content. The only allowed downgrade is Linkit's own lightweight omission of oversized media when the full upload exceeds the size limit.
