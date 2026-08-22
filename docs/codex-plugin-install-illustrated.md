# Linkit Install Guide for ChatGPT Desktop Codex

Audience: users who have received a Linkit activation code.
Goal: install Linkit in your own environment and publish your first public Linkit URL.

No separate install package is required. Codex installs Linkit from the public GitHub repository.

---

## 1. Get a Linkit activation code

1. Open `https://linkit.aidl.one`.
2. Click `Get activation code`.
3. Send the access request email.
4. Wait for a Linkit activation code to be sent back to you.

---

## 2. Add the Linkit marketplace in ChatGPT Desktop

### UI sketch

```text
ChatGPT Desktop - Codex

Left sidebar
  Chats
  Plugins  <-- open this
  Settings

Main panel: Plugins
  Marketplace
  [ Import marketplace.json ]  <-- click this

  Linkit                                  [Install]
  Share Codex-built pages as public links
```

### Steps

1. Open ChatGPT Desktop, switch to `Codex`, and go to `Plugins`.
2. Open the plugin source dropdown. It usually shows `Built by OpenAI`.
3. Click `Add more`.
4. Add a repository marketplace source with these values:
   - Repository URL: `https://github.com/smartgalilei/Linkit`
   - Git reference: `main`
   - Marketplace path / sparse path: `.agents/plugins`
   - Source name, if asked: `Linkit Plugins`
5. Save the source.
6. Switch the source dropdown to `Linkit Plugins`.
7. Find `Linkit` in the plugin list.
8. Click `Install`, then `Enable`.

---

## 3. Run one-time activation

Open a terminal in the root folder of this repository. The root folder is the folder that contains `README.md` and the `plugins` folder.

Check that you are in the right folder:

```bash
ls plugins/linkit/scripts/login.sh
```

Then run:

```bash
plugins/linkit/scripts/login.sh <activation-code>
```

Activation codes are valid for 12 hours by default and can be used once.

---

## 4. Start publishing from Codex

### UI sketch

```text
Chat

User: @Linkit publish this with Linkit

Assistant tool result:
{
  "url": "https://linkit.aidl.one/abc123def0",
  "expiresAt": "2026-05-29T12:34:56.000Z"
}
```

### First prompts to try

1. `@Linkit publish this with Linkit`
2. `@Linkit publish /path/to/your/dist`
3. `@Linkit publish /path/to/index.html`

---

## Terminal helpers

The installed repository also includes terminal helpers:

```bash
plugins/linkit/scripts/publish-html.sh /path/to/file.html
plugins/linkit/scripts/publish-dir.sh /path/to/dist
```

Or start the MCP server:

```bash
plugins/linkit/scripts/run-mcp.sh
```

---

## Troubleshooting

1. `401 unauthorized`: the API key is missing, mistyped, or expired.
2. `429 daily publish limit reached`: the 10-successful-publishes-per-day quota has been used.
3. Linkit is not visible: confirm the imported `marketplace.json` is the Linkit version and the plugin is enabled.
4. The Linkit URL does not open: confirm the URL starts with `https://linkit.aidl.one/` and has not expired.
5. `invalid activation code`: the activation code is mistyped, expired, or already used.
