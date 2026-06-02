# Linkit Codex Plugin

Linkit turns Codex-built HTML pages and static demo folders into temporary public preview links.

Homepage: https://linkit.smartgeo.tokyo

Current limits:

- 10 successful publishes per user per UTC day
- static bundles up to 10 MB
- links expire after 3 days
- hosted HTML previews include a Linkit badge and report link

Linkit is for temporary previews, not production hosting. Do not publish secrets, credentials, private keys, payment card data, sensitive personal data, malware, phishing content, or unlawful content.

## Install In Codex App

1. Open Codex App.
2. Go to `Plugins`.
3. Add this repository as a plugin marketplace source.
4. Use sparse path `.agents/plugins` when Codex asks for the marketplace path.
5. Install and enable `Linkit`.
6. Run one-time activation:

```bash
plugins/linkit/scripts/login.sh <activation-code>
```

Activation stores your Linkit API key in macOS Keychain when available. On Windows, WSL, Linux, or other environments without macOS Keychain, Linkit stores the credential in `plugins/linkit/.env.local`.

See [docs/codex-plugin-install-illustrated.md](docs/codex-plugin-install-illustrated.md) for the illustrated install guide.

## Use

### Codex Plugin

In Codex:

```text
@Linkit publish this HTML as a temporary preview link
```

For a local build output:

```text
@Linkit publish /path/to/dist
```

Terminal helpers are also included:

```bash
plugins/linkit/scripts/publish-html.sh /path/to/file.html
plugins/linkit/scripts/publish-dir.sh /path/to/dist
```

### Linkit GPT

Linkit is also available in ChatGPT GPTs. Open ChatGPT GPTs, search for `Linkit`, then upload or provide a complete single-file HTML page. Linkit returns a temporary public preview URL that expires after 3 days.

## Support

- Homepage: https://linkit.smartgeo.tokyo
- Privacy: https://linkit.smartgeo.tokyo/privacy
- Terms: https://linkit.smartgeo.tokyo/terms
- Support: https://linkit.smartgeo.tokyo/support

## License

All rights reserved. This repository is provided for Linkit plugin installation and use.
