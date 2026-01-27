import {
  readConfigFileSnapshot,
  validateConfigObjectWithPlugins,
  writeConfigFile,
} from "../../config/config.js";
import {
  getConfigValueAtPath,
  parseConfigPath,
  setConfigValueAtPath,
  unsetConfigValueAtPath,
} from "../../config/config-paths.js";
import {
  getConfigOverrides,
  resetConfigOverrides,
  setConfigOverride,
  unsetConfigOverride,
} from "../../config/runtime-overrides.js";
import { resolveChannelConfigWrites } from "../../channels/plugins/config-writes.js";
import { normalizeChannelId } from "../../channels/registry.js";
import { logVerbose } from "../../globals.js";
import { tr, tri } from "../../i18n/overlay-replies.js";
import type { CommandHandler } from "./commands-types.js";
import { parseConfigCommand } from "./config-commands.js";
import { parseDebugCommand } from "./debug-commands.js";

export const handleConfigCommand: CommandHandler = async (params, allowTextCommands) => {
  if (!allowTextCommands) return null;
  const configCommand = parseConfigCommand(params.command.commandBodyNormalized);
  if (!configCommand) return null;
  if (!params.command.isAuthorizedSender) {
    logVerbose(
      `Ignoring /config from unauthorized sender: ${params.command.senderId || "<unknown>"}`,
    );
    return { shouldContinue: false };
  }
  if (params.cfg.commands?.config !== true) {
    return {
      shouldContinue: false,
      reply: {
        text: `⚠️ ${tr("config.disabled", "/config is disabled. Set commands.config=true to enable.")}`,
      },
    };
  }
  if (configCommand.action === "error") {
    return {
      shouldContinue: false,
      reply: { text: `⚠️ ${configCommand.message}` },
    };
  }

  if (configCommand.action === "set" || configCommand.action === "unset") {
    const channelId = params.command.channelId ?? normalizeChannelId(params.command.channel);
    const allowWrites = resolveChannelConfigWrites({
      cfg: params.cfg,
      channelId,
      accountId: params.ctx.AccountId,
    });
    if (!allowWrites) {
      const channelLabel = channelId ?? "this channel";
      const hint = channelId
        ? `channels.${channelId}.configWrites=true`
        : "channels.<channel>.configWrites=true";
      return {
        shouldContinue: false,
        reply: {
          text: `⚠️ ${tri("config.writesDisabled", `Config writes are disabled for ${channelLabel}. Set ${hint} to enable.`, { channel: channelLabel, hint })}`,
        },
      };
    }
  }

  const snapshot = await readConfigFileSnapshot();
  if (!snapshot.valid || !snapshot.parsed || typeof snapshot.parsed !== "object") {
    return {
      shouldContinue: false,
      reply: {
        text: `⚠️ ${tr("config.invalid", "Config file is invalid; fix it before using /config.")}`,
      },
    };
  }
  const parsedBase = structuredClone(snapshot.parsed as Record<string, unknown>);

  if (configCommand.action === "show") {
    const pathRaw = configCommand.path?.trim();
    if (pathRaw) {
      const parsedPath = parseConfigPath(pathRaw);
      if (!parsedPath.ok || !parsedPath.path) {
        return {
          shouldContinue: false,
          reply: { text: `⚠️ ${parsedPath.error ?? tr("config.invalidPath", "Invalid path.")}` },
        };
      }
      const value = getConfigValueAtPath(parsedBase, parsedPath.path);
      const rendered = JSON.stringify(value ?? null, null, 2);
      const showLabel = tri("config.show", `Config ${pathRaw}:`, { path: pathRaw });
      return {
        shouldContinue: false,
        reply: {
          text: `⚙️ ${showLabel}\n\`\`\`json\n${rendered}\n\`\`\``,
        },
      };
    }
    const json = JSON.stringify(parsedBase, null, 2);
    const showRawLabel = tr("config.showRaw", "Config (raw):");
    return {
      shouldContinue: false,
      reply: { text: `⚙️ ${showRawLabel}\n\`\`\`json\n${json}\n\`\`\`` },
    };
  }

  if (configCommand.action === "unset") {
    const parsedPath = parseConfigPath(configCommand.path);
    if (!parsedPath.ok || !parsedPath.path) {
      return {
        shouldContinue: false,
        reply: { text: `⚠️ ${parsedPath.error ?? tr("config.invalidPath", "Invalid path.")}` },
      };
    }
    const removed = unsetConfigValueAtPath(parsedBase, parsedPath.path);
    if (!removed) {
      return {
        shouldContinue: false,
        reply: { text: `⚙️ ${tri("config.noValue", `No config value found for ${configCommand.path}.`, { path: configCommand.path })}` },
      };
    }
    const validated = validateConfigObjectWithPlugins(parsedBase);
    if (!validated.ok) {
      const issue = validated.issues[0];
      return {
        shouldContinue: false,
        reply: {
          text: `⚠️ ${tri("config.invalidAfterUnset", `Config invalid after unset (${issue.path}: ${issue.message}).`, { path: issue.path, message: issue.message })}`,
        },
      };
    }
    await writeConfigFile(validated.config);
    return {
      shouldContinue: false,
      reply: { text: `⚙️ ${tri("config.removed", `Config updated: ${configCommand.path} removed.`, { path: configCommand.path })}` },
    };
  }

  if (configCommand.action === "set") {
    const parsedPath = parseConfigPath(configCommand.path);
    if (!parsedPath.ok || !parsedPath.path) {
      return {
        shouldContinue: false,
        reply: { text: `⚠️ ${parsedPath.error ?? tr("config.invalidPath", "Invalid path.")}` },
      };
    }
    setConfigValueAtPath(parsedBase, parsedPath.path, configCommand.value);
    const validated = validateConfigObjectWithPlugins(parsedBase);
    if (!validated.ok) {
      const issue = validated.issues[0];
      return {
        shouldContinue: false,
        reply: {
          text: `⚠️ ${tri("config.invalidAfterSet", `Config invalid after set (${issue.path}: ${issue.message}).`, { path: issue.path, message: issue.message })}`,
        },
      };
    }
    await writeConfigFile(validated.config);
    const valueLabel =
      typeof configCommand.value === "string"
        ? `"${configCommand.value}"`
        : JSON.stringify(configCommand.value);
    return {
      shouldContinue: false,
      reply: {
        text: `⚙️ ${tri("config.updated", `Config updated: ${configCommand.path}=${valueLabel ?? "null"}`, { path: configCommand.path, value: valueLabel ?? "null" })}`,
      },
    };
  }

  return null;
};

export const handleDebugCommand: CommandHandler = async (params, allowTextCommands) => {
  if (!allowTextCommands) return null;
  const debugCommand = parseDebugCommand(params.command.commandBodyNormalized);
  if (!debugCommand) return null;
  if (!params.command.isAuthorizedSender) {
    logVerbose(
      `Ignoring /debug from unauthorized sender: ${params.command.senderId || "<unknown>"}`,
    );
    return { shouldContinue: false };
  }
  if (params.cfg.commands?.debug !== true) {
    return {
      shouldContinue: false,
      reply: {
        text: `⚠️ ${tr("debug.disabled", "/debug is disabled. Set commands.debug=true to enable.")}`,
      },
    };
  }
  if (debugCommand.action === "error") {
    return {
      shouldContinue: false,
      reply: { text: `⚠️ ${debugCommand.message}` },
    };
  }
  if (debugCommand.action === "show") {
    const overrides = getConfigOverrides();
    const hasOverrides = Object.keys(overrides).length > 0;
    if (!hasOverrides) {
      return {
        shouldContinue: false,
        reply: { text: `⚙️ ${tr("debug.noOverrides", "Debug overrides: (none)")}` },
      };
    }
    const json = JSON.stringify(overrides, null, 2);
    const overridesLabel = tr("debug.overrides", "Debug overrides (memory-only):");
    return {
      shouldContinue: false,
      reply: {
        text: `⚙️ ${overridesLabel}\n\`\`\`json\n${json}\n\`\`\``,
      },
    };
  }
  if (debugCommand.action === "reset") {
    resetConfigOverrides();
    return {
      shouldContinue: false,
      reply: { text: `⚙️ ${tr("debug.cleared", "Debug overrides cleared; using config on disk.")}` },
    };
  }
  if (debugCommand.action === "unset") {
    const result = unsetConfigOverride(debugCommand.path);
    if (!result.ok) {
      return {
        shouldContinue: false,
        reply: { text: `⚠️ ${result.error ?? tr("config.invalidPath", "Invalid path.")}` },
      };
    }
    if (!result.removed) {
      return {
        shouldContinue: false,
        reply: {
          text: `⚙️ ${tri("debug.noOverride", `No debug override found for ${debugCommand.path}.`, { path: debugCommand.path })}`,
        },
      };
    }
    return {
      shouldContinue: false,
      reply: { text: `⚙️ ${tri("debug.removed", `Debug override removed for ${debugCommand.path}.`, { path: debugCommand.path })}` },
    };
  }
  if (debugCommand.action === "set") {
    const result = setConfigOverride(debugCommand.path, debugCommand.value);
    if (!result.ok) {
      return {
        shouldContinue: false,
        reply: { text: `⚠️ ${result.error ?? tr("config.invalidPath", "Invalid override.")}` },
      };
    }
    const valueLabel =
      typeof debugCommand.value === "string"
        ? `"${debugCommand.value}"`
        : JSON.stringify(debugCommand.value);
    return {
      shouldContinue: false,
      reply: {
        text: `⚙️ ${tri("debug.set", `Debug override set: ${debugCommand.path}=${valueLabel ?? "null"}`, { path: debugCommand.path, value: valueLabel ?? "null" })}`,
      },
    };
  }

  return null;
};
