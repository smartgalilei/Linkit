# Linkit 安装图示（Codex App / Codex CLI）

适用对象：已收到 Linkit 激活码的用户。  
目标：在自己的环境里完成安装，并发布第一个可分享链接。

---

## 1) Codex App：导入 marketplace 并安装 Linkit

### 界面示意

```text
┌──────────────────────────────────────────────────────────────┐
│ Codex App                                                    │
│                                                              │
│  Left Sidebar                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Chats                                                  │  │
│  │ Plugins   ◀ 点这里                                     │  │
│  │ Settings                                               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Main Panel: Plugins                                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Marketplace                                            │  │
│  │ [ Import marketplace.json ]  ◀ 点这个按钮              │  │
│  │                                                        │  │
│  │ Linkit                                  [Install]      │  │
│  │ Share Codex-built pages as temporary links             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 操作步骤

1. 打开 Codex App，进入 `Plugins`。
2. 点击 `Import marketplace.json`。
3. 选择我们提供的 `marketplace.json` 文件。
4. 在插件列表里找到 `Linkit`，点击 `Install`，再 `Enable`。

---

## 2) 运行一次激活（推荐）

### 方式 A：激活码登录（推荐）

```bash
plugins/linkit/scripts/login.sh 你的激活码
```

成功后会把可用凭据写入 macOS Keychain（`linkit-api-key`），后续不需要再手动填写 key。
激活码默认 12 小时有效，且只能使用一次。

### 方式 B：手动设置 API Key（兼容旧流程）

如果你已经拿到了 API key，也可以直接写入 Keychain：

```bash
security add-generic-password -a "$USER" -s linkit-api-key -w '你的API_KEY' -U
```

或使用环境变量：

```bash
export LINKIT_API_KEY='你的API_KEY'
```

如果用户是自己运行 CLI/MCP，也建议同时设置：

```bash
export LINKIT_API_BASE_URL='https://linkit.smartgeo.tokyo'
```

---

## 3) 在 Codex 里开始使用

### 界面示意

```text
┌──────────────────────────────────────────────────────────────┐
│ Chat                                                         │
│                                                              │
│ User: @Linkit publish this with Linkit                       │
│                                                              │
│ Assistant (tool result):                                     │
│ {                                                            │
│   "url": "https://linkit.smartgeo.tokyo/abc123def0",        │
│   "expiresAt": "2026-05-29T12:34:56.000Z"                   │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
```

### 首次建议输入

1. `@Linkit publish this with Linkit`
2. `@Linkit publish /path/to/your/dist`
3. `@Linkit publish /path/to/index.html as a temporary preview`

---

## Codex CLI 用户（无 App 插件界面）

CLI 用户不走 Plugins 界面，直接跑命令：

```bash
plugins/linkit/scripts/publish-html.sh /path/to/file.html
plugins/linkit/scripts/publish-dir.sh /path/to/dist
```

或启动 MCP：

```bash
plugins/linkit/scripts/run-mcp.sh
```

---

## 常见卡点排查

1. `401 unauthorized`：API Key 未配置、拼写错误、或 key 已失效。
2. `429 daily publish limit reached`：当天 10 次配额已用完。
3. 看不到 Linkit：导入的 `marketplace.json` 不是我们提供的版本，或插件未 `Enable`。
4. 发布后打不开：确认返回 URL 是 `https://linkit.smartgeo.tokyo/...`，并检查是否已过期（3天）。
5. 激活报错 `invalid activation code`：激活码填错、过期，或已被使用过一次。
