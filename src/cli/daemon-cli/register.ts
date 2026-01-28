import type { Command } from "commander";
import { t } from "../../i18n/index.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { createDefaultDeps } from "../deps.js";
import {
  runDaemonInstall,
  runDaemonRestart,
  runDaemonStart,
  runDaemonStatus,
  runDaemonStop,
  runDaemonUninstall,
} from "./runners.js";

export function registerDaemonCli(program: Command) {
  const daemon = program
    .command("daemon")
    .description(t("cli", "cmd.daemon.manage", "Manage the Gateway service (launchd/systemd/schtasks)"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted(t("cli", "help.docs", "Docs:"))} ${formatDocsLink("/cli/gateway", "docs.clawd.bot/cli/gateway")}\n`,
    );

  daemon
    .command("status")
    .description(t("cli", "cmd.daemon.status", "Show service install status + probe the Gateway"))
    .option("--url <url>", "Gateway WebSocket URL (defaults to config/remote/local)")
    .option("--token <token>", "Gateway token (if required)")
    .option("--password <password>", "Gateway password (password auth)")
    .option("--timeout <ms>", "Timeout in ms", "10000")
    .option("--no-probe", "Skip RPC probe")
    .option("--deep", "Scan system-level services", false)
    .option("--json", "Output JSON", false)
    .action(async (opts) => {
      await runDaemonStatus({
        rpc: opts,
        probe: Boolean(opts.probe),
        deep: Boolean(opts.deep),
        json: Boolean(opts.json),
      });
    });

  daemon
    .command("install")
    .description(t("cli", "cmd.daemon.install", "Install the Gateway service (launchd/systemd/schtasks)"))
    .option("--port <port>", "Gateway port")
    .option("--runtime <runtime>", "Daemon runtime (node|bun). Default: node")
    .option("--token <token>", "Gateway token (token auth)")
    .option("--force", "Reinstall/overwrite if already installed", false)
    .option("--json", "Output JSON", false)
    .action(async (opts) => {
      await runDaemonInstall(opts);
    });

  daemon
    .command("uninstall")
    .description(t("cli", "cmd.daemon.uninstall", "Uninstall the Gateway service (launchd/systemd/schtasks)"))
    .option("--json", "Output JSON", false)
    .action(async (opts) => {
      await runDaemonUninstall(opts);
    });

  daemon
    .command("start")
    .description(t("cli", "cmd.daemon.start", "Start the Gateway service (launchd/systemd/schtasks)"))
    .option("--json", "Output JSON", false)
    .action(async (opts) => {
      await runDaemonStart(opts);
    });

  daemon
    .command("stop")
    .description(t("cli", "cmd.daemon.stop", "Stop the Gateway service (launchd/systemd/schtasks)"))
    .option("--json", "Output JSON", false)
    .action(async (opts) => {
      await runDaemonStop(opts);
    });

  daemon
    .command("restart")
    .description(t("cli", "cmd.daemon.restart", "Restart the Gateway service (launchd/systemd/schtasks)"))
    .option("--json", "Output JSON", false)
    .action(async (opts) => {
      await runDaemonRestart(opts);
    });

  // Build default deps (parity with other commands).
  void createDefaultDeps();
}
