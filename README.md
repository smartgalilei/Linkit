# Linkit

AI creates the page. Linkit shares it.

Linkit turns AI-built HTML pages and static demo folders into public links without setting up hosting, deployment, or GitHub Pages.

Homepage: https://linkit.aidl.one

## Current Access

Linkit is currently free during this phase.

- The Linkit homepage supports an anonymous upload when no AI tool is available: one `.html` file up to 3 MB, or one `.zip` bundle up to 10 MB with root `index.html`. The result includes a management link for early removal.
- Codex and Claude require a Linkit activation code.
- To get an activation code, open https://linkit.aidl.one, click `Get activation code`, send the access request email, and wait for the code.
- The searchable Linkit GPT in ChatGPT GPTs does not require a separate activation code.

Do not publish secrets, credentials, private keys, payment card data, sensitive personal data, malware, phishing content, or unlawful content. Linkit creates public links and is not production hosting.

## What Linkit Supports

| Tool | Best for | Access | Current limits |
| --- | --- | --- | --- |
| Linkit website | One HTML file or ZIP static bundle without an AI tool | Open [linkit.aidl.one](https://linkit.aidl.one) | 3 MB HTML, 10 MB ZIP bundle, 3-day links, shared daily capacity |
| Codex in ChatGPT Desktop | Local HTML files, `dist/`, `build/`, and static exports | Activation code | 10 publishes/day, 10 MB bundle, 3-day links |
| Claude | Complete single-file HTML in Claude Desktop Chat, Cowork, and Code, plus Claude Web through the connected account | Activation code through the connector auth page | 10 publishes/day, 3 MB HTML, 3-day links |
| GPTs | Complete single-file HTML in ChatGPT | Search for `Linkit` in GPTs | 3 MB HTML, 3-day links, shared global quota |

Linkit is not yet listed in the official OpenAI Plugin Directory or Anthropic marketplace. Standalone terminal Claude Code CLI installation and Gemini CLI are not currently supported claims.

## Install In Codex

No separate install package is required. Codex installs Linkit from this public GitHub repository.

1. Get a Linkit activation code:
   - Open `https://linkit.aidl.one`
   - Click `Get activation code`
   - Send the access request email
   - Wait for a Linkit activation code to be sent back to you
2. Open ChatGPT Desktop and switch to `Codex`.
3. Click `Plugins` in the left sidebar.
4. Open the plugin source dropdown. It usually shows `Built by OpenAI`.
5. Click `Add more`.
6. Add this repository as a repository marketplace source:
   - Repository URL: `https://github.com/smartgalilei/Linkit`
   - Git reference: `main`
   - Marketplace path / sparse path: `.agents/plugins`
   - Source name, if asked: `Linkit Plugins`
7. Save the source, then switch the source dropdown to `Linkit Plugins`.
8. Find `Linkit`, click `Install`, then click `Enable`.
9. Open a terminal in the root folder of this repository. You are in the right folder when `ls plugins/linkit/scripts/login.sh` shows the login script.
10. Run one-time activation:

```bash
plugins/linkit/scripts/login.sh <activation-code>
```

Use Linkit from Codex:

```text
@Linkit publish this HTML
@Linkit publish /path/to/dist
```

Terminal helpers are also included:

```bash
plugins/linkit/scripts/publish-html.sh /path/to/file.html
plugins/linkit/scripts/publish-dir.sh /path/to/dist
```

See [docs/codex-plugin-install-illustrated.md](docs/codex-plugin-install-illustrated.md) for the detailed Codex guide.

## Install In Claude

1. Get a Linkit activation code from `https://linkit.aidl.one`.
2. In Claude Desktop, open `Customize` -> `Plugins`.
3. In `Personal plugins`, click `+`, then choose `Add marketplace`.
4. Enter this GitHub repository:

```text
smartgalilei/Linkit
```

5. Click `Sync`, then install `Linkit`.
6. Open the installed `Linkit` plugin.
7. Open `Connectors` inside the plugin.
8. Click `Connect`.
9. When the browser opens the Linkit authorization page, enter your activation code.

Use Linkit from Claude:

```text
Use Linkit to publish this complete HTML page.
```

The Claude plugin supports complete single-file HTML only. It has been observed working in Claude Desktop Chat, Cowork, and Code. The connected remote connector is also designed for Claude Web on the same account. For local folders such as `dist/` or `build/`, use the Codex Plugin in ChatGPT Desktop.

See [docs/claude-plugin-install.md](docs/claude-plugin-install.md) for the detailed Claude guide.

## Use Linkit GPT

1. Open ChatGPT GPTs.
2. Search for `Linkit`.
3. Open the Linkit GPT.
4. Upload or provide a complete single-file HTML page.
5. Ask Linkit to publish it and return the Linkit URL.

## Support

- Homepage: https://linkit.aidl.one
- Privacy: https://linkit.aidl.one/privacy
- Terms: https://linkit.aidl.one/terms
- Support: https://linkit.aidl.one/support

## License

All rights reserved. This repository is provided for Linkit plugin installation and use.
