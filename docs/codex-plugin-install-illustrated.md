# Linkit Install Guide for Codex App and Codex CLI

Audience: users who have received a Linkit activation code.
Goal: install Linkit in your own environment and publish your first shareable preview link.

---

## 1. Add the Linkit marketplace in Codex App

### UI sketch

```text
Codex App

Left sidebar
  Chats
  Plugins  <-- open this
  Settings

Main panel: Plugins
  Marketplace
  [ Import marketplace.json ]  <-- click this

  Linkit                                  [Install]
  Share Codex-built pages as temporary links
```

### Steps

1. Open Codex App and go to `Plugins`.
2. Click `Import marketplace.json`.
3. Select the `marketplace.json` file provided with Linkit.
4. Find `Linkit` in the plugin list.
5. Click `Install`, then `Enable`.

---

## 2. Run one-time activation

### Option A: activation code login

```bash
plugins/linkit/scripts/login.sh <activation-code>
```

After a successful activation, Linkit stores the credential in macOS Keychain as `linkit-api-key`.
Activation codes are valid for 12 hours by default and can be used once.

### Option B: manual API key setup

If you already have a Linkit API key, you can store it directly in Keychain:

```bash
security add-generic-password -a "$USER" -s linkit-api-key -w '<api-key>' -U
```

Or use an environment variable:

```bash
export LINKIT_API_KEY='<api-key>'
```

If you run the CLI or MCP server directly, also set:

```bash
export LINKIT_API_BASE_URL='https://linkit.smartgeo.tokyo'
```

---

## 3. Start publishing from Codex

### UI sketch

```text
Chat

User: @Linkit publish this with Linkit

Assistant tool result:
{
  "url": "https://linkit.smartgeo.tokyo/abc123def0",
  "expiresAt": "2026-05-29T12:34:56.000Z"
}
```

### First prompts to try

1. `@Linkit publish this with Linkit`
2. `@Linkit publish /path/to/your/dist`
3. `@Linkit publish /path/to/index.html as a temporary preview`

---

## Codex CLI users

If you do not use the Codex App plugin UI, run the helper scripts directly:

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
4. The preview URL does not open: confirm the URL starts with `https://linkit.smartgeo.tokyo/` and has not expired.
5. `invalid activation code`: the activation code is mistyped, expired, or already used.
