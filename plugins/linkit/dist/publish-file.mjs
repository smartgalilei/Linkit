// src/shared/constants.ts
var DEFAULT_MAX_HTML_BYTES = 2 * 1024 * 1024;
var DEFAULT_MAX_BUNDLE_BYTES = 10 * 1024 * 1024;
var FREE_BETA_MAX_BUNDLE_BYTES = 10 * 1024 * 1024;
var DEFAULT_GPT_MAX_HTML_BYTES = 3 * 1024 * 1024;

// src/shared/config.ts
function getMcpEnv(name, aliases = []) {
  const values = [name, ...aliases];
  for (const key of values) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }
  throw new Error(`${values.join(" or ")} is required`);
}

// src/shared/client.ts
var LinkitApiError = class extends Error {
  status;
  constructor(status, message) {
    super(message);
    this.name = "LinkitApiError";
    this.status = status;
  }
};
var LinkitClient = class {
  baseUrl;
  apiKey;
  fetchImpl;
  source;
  constructor(options) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.source = options.source;
  }
  async publishPage(input) {
    return this.postJson("/api/publish", input);
  }
  async publishBundle(input) {
    return this.postJson("/api/publish-bundle", input);
  }
  async postJson(pathname, input) {
    const response = await this.fetchImpl(`${this.baseUrl}${pathname}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
        ...this.source ? { "x-linkit-source": this.source } : {}
      },
      body: JSON.stringify(input)
    });
    if (!response.ok) {
      const message = await response.text();
      throw new LinkitApiError(response.status, message);
    }
    return await response.json();
  }
};

// src/cli/publish-file-lib.ts
import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
function requireOptionValue(option, value) {
  if (!value) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}
function parsePublishFileArgs(argv) {
  const args = {
    help: false,
    json: false,
    useStdin: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    if (arg === "--json") {
      args.json = true;
      continue;
    }
    if (arg === "--stdin") {
      args.useStdin = true;
      continue;
    }
    if (arg === "--title") {
      args.title = requireOptionValue("--title", argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--ttl-days") {
      const rawValue = requireOptionValue("--ttl-days", argv[index + 1]);
      const ttlDays = Number.parseInt(rawValue, 10);
      if (!Number.isInteger(ttlDays) || ttlDays < 1 || ttlDays > 30) {
        throw new Error("--ttl-days must be an integer between 1 and 30");
      }
      args.ttlDays = ttlDays;
      index += 1;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    if (args.inputPath) {
      throw new Error("Provide at most one input file path");
    }
    args.inputPath = arg;
  }
  if (args.useStdin && args.inputPath) {
    throw new Error("Use either --stdin or a file path, not both");
  }
  return args;
}
function inferTitleFromPath(inputPath) {
  if (!inputPath || inputPath === "-") {
    return void 0;
  }
  const filename = basename(inputPath);
  const extension = extname(filename);
  const stem = extension ? filename.slice(0, -extension.length) : filename;
  return stem || void 0;
}
async function readStream(stream) {
  let output = "";
  for await (const chunk of stream) {
    output += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
  }
  return output;
}
async function readHtmlInput(args, options = {}) {
  const readFileImpl = options.readFileImpl ?? readFile;
  const stdinStream = options.stdinStream ?? process.stdin;
  const stdinIsTty = options.stdinIsTty ?? Boolean(process.stdin.isTTY);
  const title = args.title ?? inferTitleFromPath(args.inputPath);
  if (args.inputPath) {
    const html2 = await readFileImpl(args.inputPath, "utf8");
    if (!html2.trim()) {
      throw new Error(`Input file is empty: ${args.inputPath}`);
    }
    return { html: html2, title };
  }
  if (!args.useStdin && stdinIsTty) {
    throw new Error("Provide an HTML file path or pipe HTML through stdin");
  }
  const html = await readStream(stdinStream);
  if (!html.trim()) {
    throw new Error("Standard input did not contain any HTML");
  }
  return { html, title };
}

// src/cli/publish-file.ts
function printHelp() {
  console.log(`Usage:
  <linkit-plugin>/scripts/publish-html.sh <path-to-file.html> [--title "Page title"] [--json]
  cat dist/index.html | <linkit-plugin>/scripts/publish-html.sh --stdin [--title "Page title"] [--json]

Environment:
  LINKIT_API_BASE_URL (or PREVIEWLINK_API_BASE_URL)
  LINKIT_API_KEY (or PREVIEWLINK_API_KEY)

Current free limits:
  Personal API key required. Links expire after 3 days and include a Linkit badge.
  Limit: 10 successful publishes per UTC day.`);
}
async function main() {
  const args = parsePublishFileArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  const { html, title } = await readHtmlInput(args);
  const client = new LinkitClient({
    baseUrl: getMcpEnv("LINKIT_API_BASE_URL", ["PREVIEWLINK_API_BASE_URL"]),
    apiKey: getMcpEnv("LINKIT_API_KEY", ["PREVIEWLINK_API_KEY"]),
    source: "cli"
  });
  const result = await client.publishPage({
    html,
    title,
    ttlDays: args.ttlDays
  });
  const output = {
    url: result.url,
    expiresAt: result.expiresAt
  };
  if (args.json) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }
  console.log(`Linkit URL: ${output.url}`);
  console.log(`Expires: ${output.expiresAt}`);
}
main().catch((error) => {
  const message = error instanceof LinkitApiError ? `publish failed (${error.status}): ${error.message}` : `publish failed: ${error.message}`;
  console.error(message);
  process.exit(1);
});
