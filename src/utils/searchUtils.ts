/**
 * 搜索工具函数
 * 用于处理搜索引擎前缀匹配和 URL 构建
 */

import type { SearchEngineConfig } from "../types";

/**
 * 搜索结果项类型（简化版，避免循环依赖）
 */
export interface SearchResultItem {
  type: "search";
  displayName: string;
  path: string;
}

/**
 * 检测输入是否匹配某个搜索引擎前缀
 * 如果多个引擎前缀重叠，优先匹配更长的前缀
 */
export function detectSearchIntent(
  query: string,
  engines: SearchEngineConfig[]
): { engine: SearchEngineConfig; keyword: string } | null {
  if (!query || !query.trim() || engines.length === 0) {
    return null;
  }

  // 按前缀长度降序排序，优先匹配更长的前缀
  const sortedEngines = [...engines].sort((a, b) => b.prefix.length - a.prefix.length);

  for (const engine of sortedEngines) {
    const prefix = engine.prefix;
    // 只检查前缀是否为空，不进行 trim（因为前缀可能包含空格）
    if (!prefix) continue;

    // 前缀+空格才视为搜索
    // 如果前缀本身以空格结尾（如 "s "），直接匹配前缀
    // 如果前缀不以空格结尾（如 "s"），要求查询必须以"前缀+空格"开头
    const prefixToMatch = prefix.endsWith(' ') ? prefix : prefix + ' ';
    
    if (query.startsWith(prefixToMatch)) {
      const keyword = query.slice(prefixToMatch.length).trim();
      // 只要匹配到前缀，就返回结果（即使关键词为空，也显示搜索意图）
      return { engine, keyword };
    }
  }

  return null;
}

/**
 * 构建搜索 URL，将 {query} 替换为编码后的关键词
 */
export function buildSearchUrl(urlTemplate: string, keyword: string): string {
  const encodedKeyword = encodeURIComponent(keyword);
  return urlTemplate.replace(/{query}/g, encodedKeyword);
}

/**
 * 生成搜索结果项
 */
export function getSearchResultItem(
  engine: SearchEngineConfig,
  keyword: string
): SearchResultItem {
  const searchUrl = buildSearchUrl(engine.url, keyword);
  
  return {
    type: "search",
    displayName: `在 ${engine.name} 搜索：${keyword}`,
    path: searchUrl,
  };
}

