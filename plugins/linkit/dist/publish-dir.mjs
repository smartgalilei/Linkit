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

// src/cli/publish-dir-lib.ts
import { readdir, readFile } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";

// src/shared/bundle.ts
function normalizeBundlePath(input) {
  const normalized = input.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized) {
    return null;
  }
  const segments = normalized.split("/");
  if (segments.some(
    (segment) => segment.length === 0 || segment === "." || segment === ".."
  )) {
    return null;
  }
  return segments.join("/");
}

// src/shared/lite-preview.ts
var decoder = new TextDecoder();
var encoder = new TextEncoder();
var CORE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".html",
  ".htm",
  ".ico",
  ".js",
  ".json",
  ".map",
  ".mjs",
  ".svg",
  ".txt",
  ".ttf",
  ".otf",
  ".woff",
  ".woff2",
  ".xml"
]);
var MEDIA_EXTENSIONS = /* @__PURE__ */ new Set([
  ".apng",
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".m4v",
  ".mov",
  ".mp3",
  ".mp4",
  ".ogg",
  ".png",
  ".wav",
  ".webm",
  ".webp"
]);
var LITE_HTML_OVERHEAD_BYTES = 4 * 1024;
function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${bytes} B`;
}
function buildLiteBanner(omittedItems) {
  const totalOmittedBytes = omittedItems.reduce((sum, item) => sum + item.sizeBytes, 0);
  const previewList = omittedItems.slice(0, 4).map((item) => `${item.label} (${formatBytes(item.sizeBytes)})`).join(", ");
  const extraCount = omittedItems.length > 4 ? omittedItems.length - 4 : 0;
  const summaryText = extraCount > 0 ? `${previewList}, plus ${extraCount} more` : previewList;
  return `
<style id="linkit-lite-preview-style">
  #linkit-lite-preview-banner {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 9999;
    max-width: min(92vw, 30rem);
    padding: 0.9rem 1rem;
    border-radius: 14px;
    background: rgba(12, 18, 28, 0.88);
    color: #f8fafc;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
    font: 13px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    backdrop-filter: blur(10px);
  }
  #linkit-lite-preview-banner strong {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 13px;
    letter-spacing: 0.01em;
  }
  #linkit-lite-preview-banner code {
    display: block;
    margin-top: 0.35rem;
    white-space: normal;
    word-break: break-word;
    opacity: 0.82;
    font: 11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .linkit-lite-placeholder {
    min-height: 180px;
    display: grid;
    place-items: center;
    padding: 1rem;
    margin: 0.5rem 0;
    border: 1px dashed rgba(148, 163, 184, 0.45);
    background: rgba(15, 23, 42, 0.06);
    color: rgba(15, 23, 42, 0.7);
    text-align: center;
    font: 14px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .linkit-lite-placeholder strong {
    display: block;
    margin-bottom: 0.35rem;
  }
</style>
<div id="linkit-lite-preview-banner">
  <strong>Lightweight Linkit preview</strong>
  Some large media content was omitted to stay within the temporary preview limit.
  Omitted ${omittedItems.length} items totaling ${formatBytes(totalOmittedBytes)}.
  <code>${summaryText}</code>
</div>`;
}
function injectLiteBanner(html, omittedItems) {
  const injection = buildLiteBanner(omittedItems);
  if (html.includes("</body>")) {
    return html.replace("</body>", `${injection}
</body>`);
  }
  return `${html}
${injection}`;
}
function isCoreFile(path) {
  return CORE_EXTENSIONS.has(getExtension(path));
}
function isMediaFile(path) {
  return MEDIA_EXTENSIONS.has(getExtension(path));
}
function getExtension(path) {
  const normalized = path.toLowerCase();
  const index = normalized.lastIndexOf(".");
  return index === -1 ? "" : normalized.slice(index);
}
function mediaPriority(path) {
  const normalized = path.toLowerCase();
  if (normalized.includes("logo") || normalized.includes("icon")) {
    return 0;
  }
  if (normalized.includes("poster") || normalized.includes("shot-01")) {
    return 1;
  }
  return 2;
}
function applyLiteBundleFallback(entries, maxBytes) {
  const originalBytes = entries.reduce((sum, entry) => sum + entry.sizeBytes, 0);
  if (originalBytes <= maxBytes) {
    return {
      value: entries,
      previewMode: "full",
      originalBytes,
      publishedBytes: originalBytes,
      omittedItems: []
    };
  }
  const coreEntries = entries.filter((entry) => isCoreFile(entry.path) || !isMediaFile(entry.path));
  const mediaEntries = entries.filter((entry) => isMediaFile(entry.path) && !isCoreFile(entry.path)).sort((left, right) => {
    const priorityDiff = mediaPriority(left.path) - mediaPriority(right.path);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return left.sizeBytes - right.sizeBytes;
  });
  const htmlCount = coreEntries.filter((entry) => /\.html?$/i.test(entry.path)).length;
  const reservedOverhead = htmlCount * LITE_HTML_OVERHEAD_BYTES;
  let usedBytes = coreEntries.reduce((sum, entry) => sum + entry.sizeBytes, 0) + reservedOverhead;
  if (usedBytes > maxBytes) {
    throw new Error(
      `Core preview files total ${formatBytes(usedBytes - reservedOverhead)}, which still exceeds the ${formatBytes(maxBytes)} limit even without heavy media.`
    );
  }
  const selectedMedia = [];
  const omittedItems = [];
  for (const entry of mediaEntries) {
    if (usedBytes + entry.sizeBytes <= maxBytes) {
      selectedMedia.push(entry);
      usedBytes += entry.sizeBytes;
      continue;
    }
    omittedItems.push({
      kind: "asset",
      label: entry.path,
      path: entry.path,
      sizeBytes: entry.sizeBytes
    });
  }
  if (omittedItems.length === 0) {
    throw new Error(
      `Bundle directory totals ${formatBytes(originalBytes)}, which exceeds the ${formatBytes(maxBytes)} limit. No large media files could be pruned automatically.`
    );
  }
  const selectedEntries = [...coreEntries, ...selectedMedia].sort((left, right) => left.path.localeCompare(right.path)).map((entry) => {
    if (!/\.html?$/i.test(entry.path)) {
      return entry;
    }
    const html = decoder.decode(entry.bytes);
    const updatedHtml = injectLiteBanner(html, omittedItems);
    const updatedBytes = encoder.encode(updatedHtml);
    return {
      ...entry,
      bytes: updatedBytes,
      sizeBytes: updatedBytes.byteLength
    };
  });
  const publishedBytes = selectedEntries.reduce((sum, entry) => sum + entry.sizeBytes, 0);
  return {
    value: selectedEntries,
    previewMode: "lite",
    originalBytes,
    publishedBytes,
    omittedItems
  };
}

// src/cli/publish-dir-lib.ts
var IGNORED_BASENAMES = /* @__PURE__ */ new Set([".DS_Store"]);
function requireOptionValue(option, value) {
  if (!value) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}
function parsePublishDirArgs(argv) {
  const args = {
    help: false,
    entryPath: "index.html",
    json: false,
    liteIfNeeded: false,
    maxBytes: DEFAULT_MAX_BUNDLE_BYTES
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
    if (arg === "--lite-if-needed") {
      args.liteIfNeeded = true;
      continue;
    }
    if (arg === "--entry") {
      args.entryPath = requireOptionValue("--entry", argv[index + 1]);
      index += 1;
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
    if (arg === "--max-bytes") {
      const rawValue = requireOptionValue("--max-bytes", argv[index + 1]);
      const maxBytes = Number.parseInt(rawValue, 10);
      if (!Number.isInteger(maxBytes) || maxBytes < 1) {
        throw new Error("--max-bytes must be a positive integer");
      }
      args.maxBytes = maxBytes;
      index += 1;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    if (args.inputPath) {
      throw new Error("Provide exactly one bundle directory path");
    }
    args.inputPath = arg;
  }
  const normalizedEntryPath = normalizeBundlePath(args.entryPath);
  if (!normalizedEntryPath) {
    throw new Error("--entry must be a normalized relative file path");
  }
  args.entryPath = normalizedEntryPath;
  return args;
}
function inferTitleFromDirectory(inputPath) {
  if (!inputPath) {
    return void 0;
  }
  return basename(resolve(inputPath)) || void 0;
}
async function walkDirectory(directoryPath, readdirImpl, output) {
  const entries = await readdirImpl(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      await walkDirectory(absolutePath, readdirImpl, output);
      continue;
    }
    if (entry.isFile()) {
      output.push(absolutePath);
    }
  }
}
function shouldIgnoreRelativePath(path) {
  const segments = path.split("/");
  return segments.some((segment) => segment === ".git" || IGNORED_BASENAMES.has(segment));
}
async function collectBundleFiles(inputPath, options = {}) {
  const readFileImpl = options.readFileImpl ?? readFile;
  const readdirImpl = options.readdirImpl ?? readdir;
  const rootPath = resolve(inputPath);
  const absoluteFiles = [];
  await walkDirectory(rootPath, readdirImpl, absoluteFiles);
  if (absoluteFiles.length === 0) {
    throw new Error(`Bundle directory is empty: ${inputPath}`);
  }
  absoluteFiles.sort();
  const entries = await Promise.all(
    absoluteFiles.map(async (absolutePath) => {
      const relativePath = normalizeBundlePath(relative(rootPath, absolutePath));
      if (!relativePath) {
        throw new Error(`Could not normalize bundle file path: ${absolutePath}`);
      }
      if (shouldIgnoreRelativePath(relativePath)) {
        return null;
      }
      const content = await readFileImpl(absolutePath);
      return {
        path: relativePath,
        bytes: content,
        sizeBytes: content.byteLength
      };
    })
  );
  const filteredEntries = [];
  for (const entry of entries) {
    if (entry) {
      filteredEntries.push(entry);
    }
  }
  const planned = applyLiteBundleFallback(
    filteredEntries,
    options.maxBytes ?? DEFAULT_MAX_BUNDLE_BYTES
  );
  const files = planned.value.map((entry) => ({
    path: entry.path,
    contentBase64: Buffer.from(entry.bytes).toString("base64")
  }));
  return {
    files,
    mode: planned.previewMode,
    originalBytes: planned.originalBytes,
    publishedBytes: planned.publishedBytes,
    omittedFiles: planned.omittedItems.filter((item) => item.path).map((item) => ({
      path: item.path,
      sizeBytes: item.sizeBytes
    }))
  };
}

// src/cli/publish-dir.ts
function printHelp() {
  console.log(`Usage:
  <linkit-plugin>/scripts/publish-dir.sh <path-to-directory> [--entry index.html] [--title "Site title"] [--max-bytes 10485760] [--json]
  <linkit-plugin>/scripts/publish-dir.sh <path-to-directory> [--entry index.html] [--lite-if-needed]

Environment:
  LINKIT_API_BASE_URL (or PREVIEWLINK_API_BASE_URL)
  LINKIT_API_KEY (or PREVIEWLINK_API_KEY)

Notes:
  Linkit currently requires a personal API key, supports bundles up to 10 MB,
  limits publishing to 10 successful previews per UTC day, and creates
  3-day links with a Linkit badge on hosted HTML pages.
  Linkit preserves the full original bundle whenever it fits within the limit.
  If the bundle exceeds the limit because of heavy media, Linkit automatically
  publishes a lightweight preview that omits only the oversized media files.
  --lite-if-needed is kept for backward compatibility and is no longer required.`);
}
async function main() {
  const args = parsePublishDirArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (!args.inputPath) {
    throw new Error("Provide a bundle directory path");
  }
  const collected = await collectBundleFiles(args.inputPath, {
    liteIfNeeded: args.liteIfNeeded,
    maxBytes: args.maxBytes
  });
  const client = new LinkitClient({
    baseUrl: getMcpEnv("LINKIT_API_BASE_URL", ["PREVIEWLINK_API_BASE_URL"]),
    apiKey: getMcpEnv("LINKIT_API_KEY", ["PREVIEWLINK_API_KEY"]),
    source: "cli"
  });
  const result = await client.publishBundle({
    entryPath: args.entryPath,
    files: collected.files,
    title: args.title ?? inferTitleFromDirectory(args.inputPath),
    ttlDays: args.ttlDays
  });
  const output = {
    url: result.url,
    expiresAt: result.expiresAt,
    mode: collected.mode,
    originalBytes: collected.originalBytes,
    publishedBytes: collected.publishedBytes,
    omittedFiles: collected.omittedFiles
  };
  if (args.json) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }
  console.log(`Temporary bundle preview link: ${output.url}`);
  console.log(`Expires: ${output.expiresAt}`);
  if (output.mode === "lite") {
    console.log(
      `Published a lightweight preview: ${output.publishedBytes} of ${output.originalBytes} bytes kept.`
    );
    console.log(`Omitted ${output.omittedFiles.length} heavy media files.`);
  }
}
main().catch((error) => {
  const message = error instanceof LinkitApiError ? `publish failed (${error.status}): ${error.message}` : `publish failed: ${error.message}`;
  console.error(message);
  process.exit(1);
});
