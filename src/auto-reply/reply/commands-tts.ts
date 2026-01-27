import { logVerbose } from "../../globals.js";
import { t } from "../../i18n/index.js";
import type { ReplyPayload } from "../types.js";
import type { CommandHandler } from "./commands-types.js";
import {
  getLastTtsAttempt,
  getTtsMaxLength,
  getTtsProvider,
  isSummarizationEnabled,
  isTtsEnabled,
  isTtsProviderConfigured,
  resolveTtsApiKey,
  resolveTtsConfig,
  resolveTtsPrefsPath,
  setLastTtsAttempt,
  setSummarizationEnabled,
  setTtsEnabled,
  setTtsMaxLength,
  setTtsProvider,
  textToSpeech,
} from "../../tts/tts.js";

type ParsedTtsCommand = {
  action: string;
  args: string;
};

function parseTtsCommand(normalized: string): ParsedTtsCommand | null {
  // Accept `/tts` and `/tts <action> [args]` as a single control surface.
  if (normalized === "/tts") return { action: "status", args: "" };
  if (!normalized.startsWith("/tts ")) return null;
  const rest = normalized.slice(5).trim();
  if (!rest) return { action: "status", args: "" };
  const [action, ...tail] = rest.split(/\s+/);
  return { action: action.toLowerCase(), args: tail.join(" ").trim() };
}

function ttsUsage(): ReplyPayload {
  // Keep usage in one place so help/validation stays consistent.
  const helpTitle = t("tts", "help.title", "TTS (Text-to-Speech) Help");
  const commandsTitle = t("tts", "help.commands", "Commands");
  const providersTitle = t("tts", "help.providers", "Providers");
  const limitTitle = t("tts", "help.limit", "Text Limit (default: 1500, max: 4096)");
  const examplesTitle = t("tts", "help.examples", "Examples");
  return {
    text:
      `🔊 **${helpTitle}**\n\n` +
      `**${commandsTitle}:**\n` +
      `• /tts on — ${t("tts", "cmd.on", "Enable automatic TTS for replies")}\n` +
      `• /tts off — ${t("tts", "cmd.off", "Disable TTS")}\n` +
      `• /tts status — ${t("tts", "cmd.status", "Show current settings")}\n` +
      `• /tts provider [name] — ${t("tts", "cmd.provider", "View/change provider")}\n` +
      `• /tts limit [number] — ${t("tts", "cmd.limit", "View/change text limit")}\n` +
      `• /tts summary [on|off] — ${t("tts", "cmd.summary", "View/change auto-summary")}\n` +
      `• /tts audio <text> — ${t("tts", "cmd.audio", "Generate audio from text")}\n\n` +
      `**${providersTitle}:**\n` +
      `• edge — ${t("tts", "provider.edge", "Free, fast (default)")}\n` +
      `• openai — ${t("tts", "provider.openai", "High quality (requires API key)")}\n` +
      `• elevenlabs — ${t("tts", "provider.elevenlabs", "Premium voices (requires API key)")}\n\n` +
      `**${limitTitle}:**\n` +
      `${t("tts", "limit.desc", "When text exceeds the limit")}:\n` +
      `• ${t("tts", "limit.summaryOn", "Summary ON: AI summarizes, then generates audio")}\n` +
      `• ${t("tts", "limit.summaryOff", "Summary OFF: Truncates text, then generates audio")}\n\n` +
      `**${examplesTitle}:**\n` +
      `/tts provider edge\n` +
      `/tts limit 2000\n` +
      `/tts audio Hello, this is a test!`,
  };
}

export const handleTtsCommands: CommandHandler = async (params, allowTextCommands) => {
  if (!allowTextCommands) return null;
  const parsed = parseTtsCommand(params.command.commandBodyNormalized);
  if (!parsed) return null;

  if (!params.command.isAuthorizedSender) {
    logVerbose(
      `Ignoring TTS command from unauthorized sender: ${params.command.senderId || "<unknown>"}`,
    );
    return { shouldContinue: false };
  }

  const config = resolveTtsConfig(params.cfg);
  const prefsPath = resolveTtsPrefsPath(config);
  const action = parsed.action;
  const args = parsed.args;

  if (action === "help") {
    return { shouldContinue: false, reply: ttsUsage() };
  }

  if (action === "on") {
    setTtsEnabled(prefsPath, true);
    return { shouldContinue: false, reply: { text: `🔊 ${t("tts", "enabled", "TTS enabled.")}` } };
  }

  if (action === "off") {
    setTtsEnabled(prefsPath, false);
    return { shouldContinue: false, reply: { text: `🔇 ${t("tts", "disabled", "TTS disabled.")}` } };
  }

  if (action === "audio") {
    if (!args.trim()) {
      const audioUsageTitle = t("tts", "audio.title", "Generate audio from text.");
      const usageLabel = t("tts", "audio.usage", "Usage");
      const exampleLabel = t("tts", "audio.example", "Example");
      return {
        shouldContinue: false,
        reply: {
          text:
            `🎤 ${audioUsageTitle}\n\n` +
            `${usageLabel}: /tts audio <text>\n` +
            `${exampleLabel}: /tts audio Hello, this is a test!`,
        },
      };
    }

    const start = Date.now();
    const result = await textToSpeech({
      text: args,
      cfg: params.cfg,
      channel: params.command.channel,
      prefsPath,
    });

    if (result.success && result.audioPath) {
      // Store last attempt for `/tts status`.
      setLastTtsAttempt({
        timestamp: Date.now(),
        success: true,
        textLength: args.length,
        summarized: false,
        provider: result.provider,
        latencyMs: result.latencyMs,
      });
      const payload: ReplyPayload = {
        mediaUrl: result.audioPath,
        audioAsVoice: result.voiceCompatible === true,
      };
      return { shouldContinue: false, reply: payload };
    }

    // Store failure details for `/tts status`.
    setLastTtsAttempt({
      timestamp: Date.now(),
      success: false,
      textLength: args.length,
      summarized: false,
      error: result.error,
      latencyMs: Date.now() - start,
    });
    return {
      shouldContinue: false,
      reply: { text: `❌ ${t("tts", "error.generating", "Error generating audio")}: ${result.error ?? t("tts", "error.unknown", "unknown error")}` },
    };
  }

  if (action === "provider") {
    const currentProvider = getTtsProvider(config, prefsPath);
    if (!args.trim()) {
      const hasOpenAI = Boolean(resolveTtsApiKey(config, "openai"));
      const hasElevenLabs = Boolean(resolveTtsApiKey(config, "elevenlabs"));
      const hasEdge = isTtsProviderConfigured(config, "edge");
      const providerTitle = t("tts", "provider.title", "TTS provider");
      const primaryLabel = t("tts", "provider.primary", "Primary");
      const usageLabel = t("tts", "audio.usage", "Usage");
      return {
        shouldContinue: false,
        reply: {
          text:
            `🎙️ ${providerTitle}\n` +
            `${primaryLabel}: ${currentProvider}\n` +
            `OpenAI key: ${hasOpenAI ? "✅" : "❌"}\n` +
            `ElevenLabs key: ${hasElevenLabs ? "✅" : "❌"}\n` +
            `Edge enabled: ${hasEdge ? "✅" : "❌"}\n` +
            `${usageLabel}: /tts provider openai | elevenlabs | edge`,
        },
      };
    }

    const requested = args.trim().toLowerCase();
    if (requested !== "openai" && requested !== "elevenlabs" && requested !== "edge") {
      return { shouldContinue: false, reply: ttsUsage() };
    }

    setTtsProvider(prefsPath, requested);
    return {
      shouldContinue: false,
      reply: { text: `✅ ${t("tts", "provider.set", "TTS provider set to")} ${requested}.` },
    };
  }

  if (action === "limit") {
    if (!args.trim()) {
      const currentLimit = getTtsMaxLength(prefsPath);
      const limitTitle = t("tts", "limit.title", "TTS limit");
      const charsLabel = t("tts", "limit.chars", "characters");
      const limitDesc = t("tts", "limit.triggerDesc", "Text longer than this triggers summary (if enabled).");
      const rangeDesc = t("tts", "limit.range", "Range: 100-4096 chars (Telegram max).");
      const changeLabel = t("tts", "limit.change", "To change");
      const exampleLabel = t("tts", "audio.example", "Example");
      return {
        shouldContinue: false,
        reply: {
          text:
            `📏 ${limitTitle}: ${currentLimit} ${charsLabel}.\n\n` +
            `${limitDesc}\n` +
            `${rangeDesc}\n\n` +
            `${changeLabel}: /tts limit <number>\n` +
            `${exampleLabel}: /tts limit 2000`,
        },
      };
    }
    const next = Number.parseInt(args.trim(), 10);
    if (!Number.isFinite(next) || next < 100 || next > 4096) {
      return {
        shouldContinue: false,
        reply: { text: `❌ ${t("tts", "limit.invalid", "Limit must be between 100 and 4096 characters.")}` },
      };
    }
    setTtsMaxLength(prefsPath, next);
    return {
      shouldContinue: false,
      reply: { text: `✅ ${t("tts", "limit.set", "TTS limit set to")} ${next} ${t("tts", "limit.chars", "characters")}.` },
    };
  }

  if (action === "summary") {
    if (!args.trim()) {
      const enabled = isSummarizationEnabled(prefsPath);
      const maxLen = getTtsMaxLength(prefsPath);
      const summaryTitle = t("tts", "summary.title", "TTS auto-summary");
      const onLabel = t("tts", "summary.on", "on");
      const offLabel = t("tts", "summary.off", "off");
      const whenExceedsLabel = t("tts", "summary.whenExceeds", "When text exceeds");
      const charsLabel = t("tts", "limit.chars", "characters");
      const changeLabel = t("tts", "limit.change", "To change");
      return {
        shouldContinue: false,
        reply: {
          text:
            `📝 ${summaryTitle}: ${enabled ? onLabel : offLabel}.\n\n` +
            `${whenExceedsLabel} ${maxLen} ${charsLabel}:\n` +
            `• ON: ${t("tts", "summary.onDesc", "summarizes text, then generates audio")}\n` +
            `• OFF: ${t("tts", "summary.offDesc", "truncates text, then generates audio")}\n\n` +
            `${changeLabel}: /tts summary on | off`,
        },
      };
    }
    const requested = args.trim().toLowerCase();
    if (requested !== "on" && requested !== "off") {
      return { shouldContinue: false, reply: ttsUsage() };
    }
    setSummarizationEnabled(prefsPath, requested === "on");
    return {
      shouldContinue: false,
      reply: {
        text: requested === "on"
          ? `✅ ${t("tts", "summary.enabled", "TTS auto-summary enabled.")}`
          : `❌ ${t("tts", "summary.disabled", "TTS auto-summary disabled.")}`,
      },
    };
  }

  if (action === "status") {
    const enabled = isTtsEnabled(config, prefsPath);
    const provider = getTtsProvider(config, prefsPath);
    const hasKey = isTtsProviderConfigured(config, provider);
    const maxLength = getTtsMaxLength(prefsPath);
    const summarize = isSummarizationEnabled(prefsPath);
    const last = getLastTtsAttempt();
    const statusTitle = t("tts", "status.title", "TTS status");
    const stateLabel = t("tts", "status.state", "State");
    const enabledLabel = t("tts", "status.enabled", "enabled");
    const disabledLabel = t("tts", "status.disabled", "disabled");
    const providerLabel = t("tts", "provider.title", "Provider");
    const configuredLabel = t("tts", "status.configured", "configured");
    const notConfiguredLabel = t("tts", "status.notConfigured", "not configured");
    const limitLabel = t("tts", "limit.title", "Text limit");
    const charsLabel = t("tts", "limit.chars", "chars");
    const summaryLabel = t("tts", "summary.title", "Auto-summary");
    const onLabel = t("tts", "summary.on", "on");
    const offLabel = t("tts", "summary.off", "off");
    const lines = [
      `📊 ${statusTitle}`,
      `${stateLabel}: ${enabled ? `✅ ${enabledLabel}` : `❌ ${disabledLabel}`}`,
      `${providerLabel}: ${provider} (${hasKey ? `✅ ${configuredLabel}` : `❌ ${notConfiguredLabel}`})`,
      `${limitLabel}: ${maxLength} ${charsLabel}`,
      `${summaryLabel}: ${summarize ? onLabel : offLabel}`,
    ];
    if (last) {
      const timeAgo = Math.round((Date.now() - last.timestamp) / 1000);
      const lastAttemptLabel = t("tts", "status.lastAttempt", "Last attempt");
      const agoLabel = t("tts", "status.ago", "s ago");
      const textLabel = t("tts", "status.text", "Text");
      const summarizedLabel = t("tts", "status.summarized", "summarized");
      const latencyLabel = t("tts", "status.latency", "Latency");
      const errorLabel = t("tts", "status.error", "Error");
      lines.push("");
      lines.push(`${lastAttemptLabel} (${timeAgo}${agoLabel}): ${last.success ? "✅" : "❌"}`);
      lines.push(`${textLabel}: ${last.textLength} ${charsLabel}${last.summarized ? ` (${summarizedLabel})` : ""}`);
      if (last.success) {
        lines.push(`${providerLabel}: ${last.provider ?? "unknown"}`);
        lines.push(`${latencyLabel}: ${last.latencyMs ?? 0}ms`);
      } else if (last.error) {
        lines.push(`${errorLabel}: ${last.error}`);
      }
    }
    return { shouldContinue: false, reply: { text: lines.join("\n") } };
  }

  return { shouldContinue: false, reply: ttsUsage() };
};
