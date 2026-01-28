import type { ModelDefinitionConfig } from "../config/types.js";

export const DMXAPI_DEFAULT_BASE_URL = "https://www.dmxapi.cn/v1";
export const DMXAPI_DEFAULT_MODEL_ID = "claude-opus-4-5-20251101-cc";
export const DMXAPI_DEFAULT_MODEL_REF = `dmxapi/${DMXAPI_DEFAULT_MODEL_ID}`;
export const DMXAPI_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const DMXAPI_MODEL_CATALOG = [
  {
    id: "claude-opus-4-5-20251101-cc",
    name: "Claude Opus 4.5 CC",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 16384,
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 8192,
  },
  {
    id: "claude-sonnet-4-20250514-thinking",
    name: "Claude Sonnet 4 Thinking",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 16000,
  },
  {
    id: "claude-3-7-sonnet-20250219",
    name: "Claude 3.7 Sonnet",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 8192,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 8192,
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 8192,
  },
] as const;

export type DmxapiCatalogEntry = (typeof DMXAPI_MODEL_CATALOG)[number];

export function buildDmxapiModelDefinition(entry: DmxapiCatalogEntry): ModelDefinitionConfig {
  return {
    id: entry.id,
    name: entry.name,
    reasoning: entry.reasoning,
    input: [...entry.input],
    cost: DMXAPI_DEFAULT_COST,
    contextWindow: entry.contextWindow,
    maxTokens: entry.maxTokens,
  };
}
