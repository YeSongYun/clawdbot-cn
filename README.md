# Clawdbot 中文版

DMXAPI 维护的 Clawdbot 汉化版本 —— 个人 AI 助手框架，支持多平台消息集成。

## 项目简介

Clawdbot 是一个运行在本地设备上的个人 AI 助手。它可以通过你常用的消息平台（WhatsApp、Telegram、Slack、Discord、Signal、iMessage 等）与你交互，提供快速、始终在线的 AI 助手体验。

## 环境要求

- **Node.js**: ≥22.12.0
- **包管理器**: npm / pnpm / bun

## 安装方法

```bash
# 配置 npm 源
npm config set registry https://npm.cnb.cool/dmxapi/clawdbot-cn/-/packages/

# 安装最新版本
npm install -g clawdbot-cn@latest
```

## 使用方法

### 1. 初始化配置

```bash
clawdbot-cn onboard
```

运行向导进行初始化配置，包括 Gateway、工作区、消息渠道和技能设置。

### 2. 记住生成的网址

向导完成后会生成一个网址 URL，请记住它以便后续访问控制面板。

### 3. 启动服务

```bash
clawdbot-cn gateway
```

启动 Gateway 服务，开始接收和处理消息。

## 支持的 AI 模型

DMXAPI 4.5 CC 系列：

| 模型 ID | 名称 | 上下文窗口 | 最大输出 |
|---------|------|-----------|---------|
| claude-opus-4-5-20251101-cc | Claude Opus 4.5 CC | 200K | 16384 |
| claude-sonnet-4-5-20250929-cc | Claude Sonnet 4.5 CC | 200K | 8192 |
| claude-haiku-4-5-20251001-cc | Claude Haiku 4.5 CC | 200K | 8192 |

## 支持的消息平台

- WhatsApp
- Telegram
- Slack
- Discord
- Signal
- iMessage
- Google Chat
- Microsoft Teams
- WebChat
- Matrix
- BlueBubbles
- Zalo

## 常用命令

| 命令 | 说明 |
|------|------|
| `clawdbot-cn onboard` | 运行初始化向导 |
| `clawdbot-cn gateway` | 启动 Gateway 服务 |
| `clawdbot-cn doctor` | 诊断配置问题 |
| `clawdbot-cn channels login` | 登录消息渠道 |
| `clawdbot-cn agent --message "消息"` | 发送消息给助手 |

## 聊天命令

在消息平台中可以使用以下命令：

- `/status` - 查看会话状态
- `/new` 或 `/reset` - 重置会话
- `/compact` - 压缩会话上下文
- `/think <level>` - 设置思考级别
- `/verbose on|off` - 开关详细模式
- `/restart` - 重启 Gateway

## 相关链接

- [DMXAPI 官网](https://www.dmxapi.cn)
- [原版 Clawdbot](https://github.com/clawdbot/clawdbot)
- [原版文档](https://docs.clawd.bot)

## 许可证

MIT License
