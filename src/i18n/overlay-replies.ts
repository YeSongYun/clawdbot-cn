/**
 * 回复文本翻译辅助函数
 */
import { t, ti } from "./index.js";

/**
 * 获取回复翻译
 */
export function tr(key: string, fallback: string): string {
  return t("replies", key, fallback);
}

/**
 * 获取带插值的回复翻译
 */
export function tri(key: string, fallback: string, vars: Record<string, string | number>): string {
  return ti("replies", key, fallback, vars);
}
