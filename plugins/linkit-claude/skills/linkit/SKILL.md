---
description: Publish complete single-file HTML pages as temporary Linkit preview links from Claude.
---

Use Linkit when the user asks to publish, share, preview, or create a temporary URL for a complete standalone HTML page.

Rules:

- Use the `publish_html_preview` MCP tool only when the complete original HTML source is available in the conversation.
- Do not create placeholder HTML from a filename, upload summary, screenshot, or attachment description.
- Do not summarize, simplify, restyle, repair, minify, or rewrite the user's HTML before publishing.
- If the raw HTML is not available, ask the user to paste the complete HTML source.
- Linkit URLs are public temporary previews with a fixed 3-day expiry.
- Do not publish secrets, credentials, private keys, or sensitive personal content.
- Return the preview URL and expiry after publishing.

If the Linkit MCP connector reports missing authentication, tell the user to request an activation code from `https://linkit.smartgeo.tokyo`, then run this in a terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/smartgalilei/Linkit/main/plugins/linkit-claude/scripts/login.sh | bash -s -- <activation-code>
```
