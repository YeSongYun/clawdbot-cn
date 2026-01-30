# 🦞 OpenClaw-cn — 个人 AI 助手中文版



<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/openclaw-logo-text-dark.png">
        <img src="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/openclaw-logo-text.png" alt="OpenClaw" width="500">
    </picture>
</p>

<img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=700&size=24&pause=1000&color=A855F7&center=true&vCenter=true&width=500&lines=%E7%94%B1+DMXAPI+%E7%BB%B4%E6%8A%A4%E6%B1%89%E5%8C%96" />

<img src="https://img.shields.io/badge/✨_支持自定义-第三方_URL-FF6B6B?style=flat-square" /><img src="https://img.shields.io/badge/🔑_支持自定义-API_Key-48DBFB?style=flat-square" />


---

## 🚀 快速开始

### 安装

使用 DMXAPI 的 npm 镜像源安装：

```bash
npm config set registry https://npm.cnb.cool/dmxapi/openclaw-cn/-/packages/
npm install -g openclaw-cn@latest
```

### 使用

```bash
# 重置配置
openclaw-cn reset

# 运行引导向导
openclaw-cn onboard

# 启动 Gateway
openclaw-cn gateway
```

### 升级

```bash
npm update -g openclaw-cn
```

---

## 📖 项目简介

**OpenClaw** 是一个运行在你自己设备上的*个人 AI 助手*。

它可以在你常用的通讯渠道上回复你（WhatsApp、Telegram、Slack、Discord、Google Chat、Signal、iMessage、Microsoft Teams、WebChat），还支持扩展渠道如 BlueBubbles、Matrix、Zalo 和 Zalo Personal。它可以在 macOS/iOS/Android 上进行语音交互，并可以渲染你控制的实时 Canvas。Gateway 只是控制平面——产品本身是助手。

### 系统要求

- **Node.js**: ≥22.12.0
- **包管理器**: npm / pnpm / bun

### 相关链接

[官网](https://openclaw.ai) · [文档](https://docs.openclaw.ai) · [DeepWiki](https://deepwiki.com/openclaw/openclaw) · [入门指南](https://docs.openclaw.ai/start/getting-started) · [更新指南](https://docs.openclaw.ai/install/updating) · [展示](https://docs.openclaw.ai/start/showcase) · [常见问题](https://docs.openclaw.ai/start/faq) · [向导](https://docs.openclaw.ai/start/wizard) · [Nix](https://github.com/openclaw/nix-clawdbot) · [Docker](https://docs.openclaw.ai/install/docker) · [Discord](https://discord.gg/clawd)

---

## ✨ 主要功能

- **[本地优先 Gateway](https://docs.openclaw.ai/gateway)** — 会话、渠道、工具和事件的单一控制平面
- **[多渠道收件箱](https://docs.openclaw.ai/channels)** — WhatsApp、Telegram、Slack、Discord、Google Chat、Signal、iMessage、BlueBubbles、Microsoft Teams、Matrix、Zalo、Zalo Personal、WebChat、macOS、iOS/Android
- **[多代理路由](https://docs.openclaw.ai/gateway/configuration)** — 将入站渠道/账户/对等方路由到隔离的代理（工作区 + 每代理会话）
- **[语音唤醒](https://docs.openclaw.ai/nodes/voicewake) + [对话模式](https://docs.openclaw.ai/nodes/talk)** — macOS/iOS/Android 上使用 ElevenLabs 的常驻语音
- **[实时 Canvas](https://docs.openclaw.ai/platforms/mac/canvas)** — 代理驱动的可视化工作区，支持 [A2UI](https://docs.openclaw.ai/platforms/mac/canvas#canvas-a2ui)
- **[一流的工具](https://docs.openclaw.ai/tools)** — 浏览器、canvas、节点、定时任务、会话以及 Discord/Slack 操作
- **[配套应用](https://docs.openclaw.ai/platforms/macos)** — macOS 菜单栏应用 + iOS/Android [节点](https://docs.openclaw.ai/nodes)
- **[引导向导](https://docs.openclaw.ai/start/wizard) + [技能](https://docs.openclaw.ai/tools/skills)** — 向导驱动的设置，包含内置/托管/工作区技能

---

## 📱 通讯渠道配置

### [WhatsApp](https://docs.openclaw.ai/channels/whatsapp)

- 链接设备: `openclaw-cn channels login`（凭证存储在 `~/.openclaw/credentials`）
- 通过 `channels.whatsapp.allowFrom` 设置允许与助手对话的白名单
- 如果设置了 `channels.whatsapp.groups`，它将成为群组白名单；包含 `"*"` 以允许所有群组

### [Telegram](https://docs.openclaw.ai/channels/telegram)

- 设置 `TELEGRAM_BOT_TOKEN` 或 `channels.telegram.botToken`（环境变量优先）
- 可选: 设置 `channels.telegram.groups`（带 `channels.telegram.groups."*".requireMention`）；设置后它将成为群组白名单（包含 `"*"` 以允许所有）。还可以根据需要设置 `channels.telegram.allowFrom` 或 `channels.telegram.webhookUrl`

```json5
{
  channels: {
    telegram: {
      botToken: "123456:ABCDEF"
    }
  }
}
```

### [Slack](https://docs.openclaw.ai/channels/slack)

- 设置 `SLACK_BOT_TOKEN` + `SLACK_APP_TOKEN`（或 `channels.slack.botToken` + `channels.slack.appToken`）

### [Discord](https://docs.openclaw.ai/channels/discord)

- 设置 `DISCORD_BOT_TOKEN` 或 `channels.discord.token`（环境变量优先）
- 可选: 设置 `commands.native`、`commands.text` 或 `commands.useAccessGroups`，以及 `channels.discord.dm.allowFrom`、`channels.discord.guilds` 或 `channels.discord.mediaMaxMb`

```json5
{
  channels: {
    discord: {
      token: "1234abcd"
    }
  }
}
```

### [Signal](https://docs.openclaw.ai/channels/signal)

- 需要 `signal-cli` 和 `channels.signal` 配置部分

### [iMessage](https://docs.openclaw.ai/channels/imessage)

- 仅限 macOS；需要登录 Messages
- 如果设置了 `channels.imessage.groups`，它将成为群组白名单；包含 `"*"` 以允许所有

### [Microsoft Teams](https://docs.openclaw.ai/channels/msteams)

- 配置 Teams 应用 + Bot Framework，然后添加 `msteams` 配置部分
- 通过 `msteams.allowFrom` 设置白名单；通过 `msteams.groupAllowFrom` 或 `msteams.groupPolicy: "open"` 设置群组访问

### [WebChat](https://docs.openclaw.ai/web/webchat)

- 使用 Gateway WebSocket；无需单独的 WebChat 端口/配置

---

## 💬 聊天命令

在 WhatsApp/Telegram/Slack/Google Chat/Microsoft Teams/WebChat 中发送这些命令（群组命令仅限所有者）：

- `/status` — 简洁的会话状态（模型 + 令牌，可用时显示费用）
- `/new` 或 `/reset` — 重置会话
- `/compact` — 压缩会话上下文（摘要）
- `/think <level>` — off|minimal|low|medium|high|xhigh（仅限 GPT-5.2 + Codex 模型）
- `/verbose on|off` — 开关详细模式
- `/usage off|tokens|full` — 每次响应的使用量页脚
- `/restart` — 重启 Gateway（群组中仅限所有者）
- `/activation mention|always` — 群组激活切换（仅限群组）

---

## 🔒 安全模型

OpenClaw 连接到真实的消息平台。将入站私信视为**不可信输入**。

完整安全指南: [安全](https://docs.openclaw.ai/gateway/security)

Telegram/WhatsApp/Signal/iMessage/Microsoft Teams/Discord/Google Chat/Slack 上的默认行为：
- **私信配对** (`dmPolicy="pairing"` / `channels.discord.dm.policy="pairing"` / `channels.slack.dm.policy="pairing"`): 未知发送者会收到一个短配对码，机器人不会处理他们的消息
- 使用以下命令批准: `openclaw-cn pairing approve <channel> <code>`（然后发送者会被添加到本地白名单存储）
- 公开入站私信需要明确选择加入: 设置 `dmPolicy="open"` 并在渠道白名单中包含 `"*"`（`allowFrom` / `channels.discord.dm.allowFrom` / `channels.slack.dm.allowFrom`）

运行 `openclaw-cn doctor` 以发现有风险/配置错误的私信策略。

### 安全配置

- **默认:** 工具在主机上为 **main** 会话运行，因此当只有你使用时，代理具有完全访问权限
- **群组/渠道安全:** 设置 `agents.defaults.sandbox.mode: "non-main"` 以在 Docker 沙箱中运行 **非主会话**（群组/渠道）；bash 将在 Docker 中为这些会话运行
- **沙箱默认值:** 白名单 `bash`、`process`、`read`、`write`、`edit`、`sessions_list`、`sessions_history`、`sessions_send`、`sessions_spawn`；黑名单 `browser`、`canvas`、`nodes`、`cron`、`discord`、`gateway`

详情: [安全指南](https://docs.openclaw.ai/gateway/security) · [Docker + 沙箱](https://docs.openclaw.ai/install/docker) · [沙箱配置](https://docs.openclaw.ai/gateway/configuration)

---

## ⚙️ 配置说明

最小配置 `~/.openclaw/openclaw.json`（模型 + 默认值）：

```json5
{
  agent: {
    model: "anthropic/claude-opus-4-5"
  }
}
```

[完整配置参考（所有键 + 示例）](https://docs.openclaw.ai/gateway/configuration)

### 浏览器控制（可选）

```json5
{
  browser: {
    enabled: true,
    color: "#FF4500"
  }
}
```

---

## 🏗️ 工作原理

```
WhatsApp / Telegram / Slack / Discord / Google Chat / Signal / iMessage / BlueBubbles / Microsoft Teams / Matrix / Zalo / Zalo Personal / WebChat
               │
               ▼
┌───────────────────────────────┐
│            Gateway            │
│         (控制平面)            │
│     ws://127.0.0.1:18789      │
└──────────────┬────────────────┘
               │
               ├─ Pi 代理 (RPC)
               ├─ CLI (openclaw-cn …)
               ├─ WebChat UI
               ├─ macOS 应用
               └─ iOS / Android 节点
```

---

## 🔧 关键子系统

- **[Gateway WebSocket 网络](https://docs.openclaw.ai/concepts/architecture)** — 客户端、工具和事件的单一 WS 控制平面（运维: [Gateway 运行手册](https://docs.openclaw.ai/gateway)）
- **[Tailscale 暴露](https://docs.openclaw.ai/gateway/tailscale)** — Gateway 仪表板 + WS 的 Serve/Funnel（远程访问: [远程](https://docs.openclaw.ai/gateway/remote)）
- **[浏览器控制](https://docs.openclaw.ai/tools/browser)** — openclaw 管理的 Chrome/Chromium，支持 CDP 控制
- **[Canvas + A2UI](https://docs.openclaw.ai/platforms/mac/canvas)** — 代理驱动的可视化工作区（A2UI 主机: [Canvas/A2UI](https://docs.openclaw.ai/platforms/mac/canvas#canvas-a2ui)）
- **[语音唤醒](https://docs.openclaw.ai/nodes/voicewake) + [对话模式](https://docs.openclaw.ai/nodes/talk)** — 常驻语音和连续对话
- **[节点](https://docs.openclaw.ai/nodes)** — Canvas、相机拍照/录制、屏幕录制、`location.get`、通知，以及 macOS 专属的 `system.run`/`system.notify`

---

## 📱 应用（可选）

Gateway 本身就能提供出色的体验。所有应用都是可选的，用于添加额外功能。

### macOS (OpenClaw.app)

- Gateway 的菜单栏控制和健康状态
- 语音唤醒 + 按键说话覆盖层
- WebChat + 调试工具
- 通过 SSH 远程控制 Gateway

注意: 需要签名构建才能使 macOS 权限在重新构建后保持（参见 `docs/mac/permissions.md`）

### iOS 节点

- 通过 Bridge 配对为节点
- 语音触发转发 + Canvas 界面
- 通过 `openclaw-cn nodes …` 控制

运行手册: [iOS 连接](https://docs.openclaw.ai/platforms/ios)

### Android 节点

- 通过与 iOS 相同的 Bridge + 配对流程配对
- 暴露 Canvas、相机和屏幕捕获命令

运行手册: [Android 连接](https://docs.openclaw.ai/platforms/android)

---

## 📚 文档

### 核心文档

- [从文档索引开始导航和了解"什么在哪里"](https://docs.openclaw.ai)
- [阅读架构概述了解 Gateway + 协议模型](https://docs.openclaw.ai/concepts/architecture)
- [需要每个键和示例时使用完整配置参考](https://docs.openclaw.ai/gateway/configuration)
- [按照运维手册运行 Gateway](https://docs.openclaw.ai/gateway)
- [了解控制 UI/Web 界面如何工作以及如何安全暴露它们](https://docs.openclaw.ai/web)
- [了解通过 SSH 隧道或 tailnet 的远程访问](https://docs.openclaw.ai/gateway/remote)
- [按照引导向导流程进行引导设置](https://docs.openclaw.ai/start/wizard)
- [通过 webhook 界面连接外部触发器](https://docs.openclaw.ai/automation/webhook)
- [设置 Gmail Pub/Sub 触发器](https://docs.openclaw.ai/automation/gmail-pubsub)
- [了解 macOS 菜单栏配套应用详情](https://docs.openclaw.ai/platforms/mac/menu-bar)
- [平台指南: Windows (WSL2)](https://docs.openclaw.ai/platforms/windows)、[Linux](https://docs.openclaw.ai/platforms/linux)、[macOS](https://docs.openclaw.ai/platforms/macos)、[iOS](https://docs.openclaw.ai/platforms/ios)、[Android](https://docs.openclaw.ai/platforms/android)
- [使用故障排除指南调试常见故障](https://docs.openclaw.ai/channels/troubleshooting)
- [在暴露任何内容之前查看安全指南](https://docs.openclaw.ai/gateway/security)

### 高级文档（发现 + 控制）

- [发现 + 传输](https://docs.openclaw.ai/gateway/discovery)
- [Bonjour/mDNS](https://docs.openclaw.ai/gateway/bonjour)
- [Gateway 配对](https://docs.openclaw.ai/gateway/pairing)
- [远程 Gateway README](https://docs.openclaw.ai/gateway/remote-gateway-readme)
- [控制 UI](https://docs.openclaw.ai/web/control-ui)
- [仪表板](https://docs.openclaw.ai/web/dashboard)

### 运维和故障排除

- [健康检查](https://docs.openclaw.ai/gateway/health)
- [Gateway 锁](https://docs.openclaw.ai/gateway/gateway-lock)
- [后台进程](https://docs.openclaw.ai/gateway/background-process)
- [浏览器故障排除 (Linux)](https://docs.openclaw.ai/tools/browser-linux-troubleshooting)
- [日志](https://docs.openclaw.ai/logging)

### 深入了解

- [代理循环](https://docs.openclaw.ai/concepts/agent-loop)
- [在线状态](https://docs.openclaw.ai/concepts/presence)
- [TypeBox 模式](https://docs.openclaw.ai/concepts/typebox)
- [RPC 适配器](https://docs.openclaw.ai/reference/rpc)
- [队列](https://docs.openclaw.ai/concepts/queue)

### 工作区和技能

- [技能配置](https://docs.openclaw.ai/tools/skills-config)
- [默认 AGENTS](https://docs.openclaw.ai/reference/AGENTS.default)
- [模板: AGENTS](https://docs.openclaw.ai/reference/templates/AGENTS)
- [模板: BOOTSTRAP](https://docs.openclaw.ai/reference/templates/BOOTSTRAP)
- [模板: IDENTITY](https://docs.openclaw.ai/reference/templates/IDENTITY)
- [模板: SOUL](https://docs.openclaw.ai/reference/templates/SOUL)
- [模板: TOOLS](https://docs.openclaw.ai/reference/templates/TOOLS)
- [模板: USER](https://docs.openclaw.ai/reference/templates/USER)

---

## 🦞 关于 Molty

OpenClaw 是为 **Molty** 构建的，一个太空龙虾 AI 助手。
由 Peter Steinberger 和社区开发。

- [openclaw.ai](https://openclaw.ai)
- [soul.md](https://soul.md)
- [steipete.me](https://steipete.me)
- [@openclaw](https://x.com/openclaw)

---

## 🤝 社区

参见 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南、维护者和如何提交 PR。
欢迎 AI/vibe-coded PR！

特别感谢 [Mario Zechner](https://mariozechner.at/) 的支持以及 [pi-mono](https://github.com/badlogic/pi-mono)。
特别感谢 Adam Doppelt 的 lobster.bot。

感谢所有贡献者：

<p align="left">
  <a href="https://github.com/steipete"><img src="https://avatars.githubusercontent.com/u/58493?v=4&s=48" width="48" height="48" alt="steipete" title="steipete"/></a> <a href="https://github.com/plum-dawg"><img src="https://avatars.githubusercontent.com/u/5909950?v=4&s=48" width="48" height="48" alt="plum-dawg" title="plum-dawg"/></a> <a href="https://github.com/bohdanpodvirnyi"><img src="https://avatars.githubusercontent.com/u/31819391?v=4&s=48" width="48" height="48" alt="bohdanpodvirnyi" title="bohdanpodvirnyi"/></a> <a href="https://github.com/iHildy"><img src="https://avatars.githubusercontent.com/u/25069719?v=4&s=48" width="48" height="48" alt="iHildy" title="iHildy"/></a> <a href="https://github.com/jaydenfyi"><img src="https://avatars.githubusercontent.com/u/213395523?v=4&s=48" width="48" height="48" alt="jaydenfyi" title="jaydenfyi"/></a> <a href="https://github.com/joaohlisboa"><img src="https://avatars.githubusercontent.com/u/8200873?v=4&s=48" width="48" height="48" alt="joaohlisboa" title="joaohlisboa"/></a> <a href="https://github.com/mneves75"><img src="https://avatars.githubusercontent.com/u/2423436?v=4&s=48" width="48" height="48" alt="mneves75" title="mneves75"/></a> <a href="https://github.com/MatthieuBizien"><img src="https://avatars.githubusercontent.com/u/173090?v=4&s=48" width="48" height="48" alt="MatthieuBizien" title="MatthieuBizien"/></a> <a href="https://github.com/MaudeBot"><img src="https://avatars.githubusercontent.com/u/255777700?v=4&s=48" width="48" height="48" alt="MaudeBot" title="MaudeBot"/></a> <a href="https://github.com/Glucksberg"><img src="https://avatars.githubusercontent.com/u/80581902?v=4&s=48" width="48" height="48" alt="Glucksberg" title="Glucksberg"/></a>
</p>

[![Star History Chart](https://api.star-history.com/svg?repos=openclaw/openclaw&type=date&legend=top-left)](https://www.star-history.com/#openclaw/openclaw&type=date&legend=top-left)
