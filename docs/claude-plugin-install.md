# Linkit Claude Plugin Install

Linkit for Claude publishes a complete single-file HTML page as a public Linkit URL. Links expire after 3 days.

This first Claude plugin is for Claude Desktop Chat and Cowork plugin use. It does not add Claude Code support.

Current scope:

- complete single-file HTML only
- remote MCP OAuth connection with a Linkit activation code
- 10 successful publishes per user per UTC day
- 3 MB maximum HTML size
- links expire after 3 days
- public Linkit URLs with a Linkit badge
- no local folder, bundle, `dist/`, or `build/` publishing from Claude

## 1. Get a Linkit activation code

1. Open `https://linkit.smartgeo.tokyo`.
2. Click `Get activation code`.
3. Email Linkit from the address you want to use.
4. Wait for your activation code.

## 2. Add the Linkit marketplace in Claude

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

## 3. Open the Linkit connector

After installing the plugin:

1. Open the installed `Linkit` plugin in Claude.
2. Open `Connectors` inside the plugin.
3. Click `Connect`.
4. Your browser opens the Linkit authorization page.
5. Enter the activation code you received.

You do not need to run a terminal activation command for the Claude plugin.

## 4. Use Linkit

In Claude, ask Linkit to publish a complete HTML page. Example:

```text
Use Linkit to publish this complete HTML page.
```

For local folders such as `dist/` or `build/`, use the Codex Plugin.
