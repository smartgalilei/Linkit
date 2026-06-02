# Linkit Claude Plugin Install

Linkit for Claude publishes a complete single-file HTML page as a temporary public preview link. Links expire after 3 days.

This first Claude plugin is for Claude Chat and Cowork plugin use. It does not add Claude Code support.

## 1. Get a Linkit activation code

1. Open `https://linkit.smartgeo.tokyo`.
2. Click `Get access`.
3. Email Linkit from the address you want to use.
4. Wait for your activation code.

## 2. Activate Linkit on your computer

Open Terminal, then run this command after replacing `<activation-code>` with the code you received:

```bash
curl -fsSL https://raw.githubusercontent.com/smartgalilei/Linkit/main/plugins/linkit-claude/scripts/login.sh | bash -s -- <activation-code>
```

The command stores your Linkit credential in `$HOME/.linkit/linkit.env`. On macOS it also tries to store the same credential in Keychain.

## 3. Add the Linkit marketplace in Claude

1. Open Claude Desktop.
2. Open `Customize`.
3. Open the `Plugins` tab.
4. In `Personal plugins`, click `+`.
5. Choose `Add marketplace`.
6. Enter this GitHub repository:

```text
smartgalilei/Linkit
```

7. Click `Sync`.
8. Install `Linkit` when it appears.

## 4. Use Linkit

In Claude, ask Linkit to publish a complete HTML page. Example:

```text
Use Linkit to publish this complete HTML page as a temporary preview URL.
```

The current Claude plugin supports complete single-file HTML only. For local folders such as `dist/` or `build/`, use the Codex Plugin.
