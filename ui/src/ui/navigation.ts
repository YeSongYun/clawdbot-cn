import type { IconName } from "./icons.js";
import { t } from "../i18n/index.js";

export function getTabGroups() {
  return [
    { label: t("nav.group.chat", "Chat"), tabs: ["chat"] as const },
    {
      label: t("nav.group.control", "Control"),
      tabs: ["overview", "channels", "instances", "sessions", "cron"] as const,
    },
    { label: t("nav.group.agent", "Agent"), tabs: ["skills", "nodes"] as const },
    { label: t("nav.group.settings", "Settings"), tabs: ["config", "debug", "logs"] as const },
  ];
}

/** @deprecated Use getTabGroups() for translated labels */
export const TAB_GROUPS = [
  { label: "Chat", tabs: ["chat"] },
  {
    label: "Control",
    tabs: ["overview", "channels", "instances", "sessions", "cron"],
  },
  { label: "Agent", tabs: ["skills", "nodes"] },
  { label: "Settings", tabs: ["config", "debug", "logs"] },
] as const;

export type Tab =
  | "overview"
  | "channels"
  | "instances"
  | "sessions"
  | "cron"
  | "skills"
  | "nodes"
  | "chat"
  | "config"
  | "debug"
  | "logs";

const TAB_PATHS: Record<Tab, string> = {
  overview: "/overview",
  channels: "/channels",
  instances: "/instances",
  sessions: "/sessions",
  cron: "/cron",
  skills: "/skills",
  nodes: "/nodes",
  chat: "/chat",
  config: "/config",
  debug: "/debug",
  logs: "/logs",
};

const PATH_TO_TAB = new Map(
  Object.entries(TAB_PATHS).map(([tab, path]) => [path, tab as Tab]),
);

export function normalizeBasePath(basePath: string): string {
  if (!basePath) return "";
  let base = basePath.trim();
  if (!base.startsWith("/")) base = `/${base}`;
  if (base === "/") return "";
  if (base.endsWith("/")) base = base.slice(0, -1);
  return base;
}

export function normalizePath(path: string): string {
  if (!path) return "/";
  let normalized = path.trim();
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

export function pathForTab(tab: Tab, basePath = ""): string {
  const base = normalizeBasePath(basePath);
  const path = TAB_PATHS[tab];
  return base ? `${base}${path}` : path;
}

export function tabFromPath(pathname: string, basePath = ""): Tab | null {
  const base = normalizeBasePath(basePath);
  let path = pathname || "/";
  if (base) {
    if (path === base) {
      path = "/";
    } else if (path.startsWith(`${base}/`)) {
      path = path.slice(base.length);
    }
  }
  let normalized = normalizePath(path).toLowerCase();
  if (normalized.endsWith("/index.html")) normalized = "/";
  if (normalized === "/") return "chat";
  return PATH_TO_TAB.get(normalized) ?? null;
}

export function inferBasePathFromPathname(pathname: string): string {
  let normalized = normalizePath(pathname);
  if (normalized.endsWith("/index.html")) {
    normalized = normalizePath(normalized.slice(0, -"/index.html".length));
  }
  if (normalized === "/") return "";
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0) return "";
  for (let i = 0; i < segments.length; i++) {
    const candidate = `/${segments.slice(i).join("/")}`.toLowerCase();
    if (PATH_TO_TAB.has(candidate)) {
      const prefix = segments.slice(0, i);
      return prefix.length ? `/${prefix.join("/")}` : "";
    }
  }
  return `/${segments.join("/")}`;
}

export function iconForTab(tab: Tab): IconName {
  switch (tab) {
    case "chat":
      return "messageSquare";
    case "overview":
      return "barChart";
    case "channels":
      return "link";
    case "instances":
      return "radio";
    case "sessions":
      return "fileText";
    case "cron":
      return "loader";
    case "skills":
      return "zap";
    case "nodes":
      return "monitor";
    case "config":
      return "settings";
    case "debug":
      return "bug";
    case "logs":
      return "scrollText";
    default:
      return "folder";
  }
}

export function titleForTab(tab: Tab) {
  switch (tab) {
    case "overview":
      return t("nav.overview", "Overview");
    case "channels":
      return t("nav.channels", "Channels");
    case "instances":
      return t("nav.instances", "Instances");
    case "sessions":
      return t("nav.sessions", "Sessions");
    case "cron":
      return t("nav.cron", "Cron Jobs");
    case "skills":
      return t("nav.skills", "Skills");
    case "nodes":
      return t("nav.nodes", "Nodes");
    case "chat":
      return t("nav.chat", "Chat");
    case "config":
      return t("nav.config", "Config");
    case "debug":
      return t("nav.debug", "Debug");
    case "logs":
      return t("nav.logs", "Logs");
    default:
      return t("nav.control", "Control");
  }
}

export function subtitleForTab(tab: Tab) {
  switch (tab) {
    case "overview":
      return t("nav.overview.subtitle", "Gateway status, entry points, and a fast health read.");
    case "channels":
      return t("nav.channels.subtitle", "Manage channels and settings.");
    case "instances":
      return t("nav.instances.subtitle", "Presence beacons from connected clients and nodes.");
    case "sessions":
      return t("nav.sessions.subtitle", "Inspect active sessions and adjust per-session defaults.");
    case "cron":
      return t("nav.cron.subtitle", "Schedule wakeups and recurring agent runs.");
    case "skills":
      return t("nav.skills.subtitle", "Manage skill availability and API key injection.");
    case "nodes":
      return t("nav.nodes.subtitle", "Paired devices, capabilities, and command exposure.");
    case "chat":
      return t("nav.chat.subtitle", "Direct gateway chat session for quick interventions.");
    case "config":
      return t("nav.config.subtitle", "Edit ~/.clawdbot/moltbot.json safely.");
    case "debug":
      return t("nav.debug.subtitle", "Gateway snapshots, events, and manual RPC calls.");
    case "logs":
      return t("nav.logs.subtitle", "Live tail of the gateway file logs.");
    default:
      return "";
  }
}
