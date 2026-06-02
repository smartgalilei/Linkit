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

No separate install package is required. Codex installs Linkit from this public GitHub repository.

1. Get a Linkit activation code:
   - Open `https://linkit.smartgeo.tokyo`
   - Click `Get access`
   - Send the access request email
   - Wait for a Linkit activation code to be sent back to you
2. Open Codex App.
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
