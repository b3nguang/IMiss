import type { Plugin, PluginContext } from "../types";
import { tauriApi } from "../api/tauri";

/**
 * 插件注册表
 * 所有插件都在这里定义和注册
 */
export const plugins: Plugin[] = [
  {
    id: "show_main_window",
    name: "录制动作",
    description: "打开主程序窗口",
    keywords: [
      "录制动作",
      "录制",
      "主窗口",
      "主程序",
      "窗口",
      "luzhidongzuo",
      "lzdz",
      "luzhi",
      "lz",
      "zhuchuangkou",
      "zck",
      "zhuchengxu",
      "zcx",
      "chuangkou",
      "ck",
      "main",
    ],
    execute: async (context: PluginContext) => {
      await tauriApi.showMainWindow();
      await context.hideLauncher();
      context.setQuery("");
      context.setSelectedIndex(0);
    },
  },
  {
    id: "memo_center",
    name: "备忘录",
    description: "查看和编辑已有的备忘录",
    keywords: [
      "备忘录",
      "beiwanglu",
      "bwl",
      "memo",
      "note",
      "记录",
      "jilu",
      "jl",
    ],
    execute: async (context: PluginContext) => {
      // 打开独立的备忘录窗口
      if (context.tauriApi) {
        await context.tauriApi.showMemoWindow();
        // 关闭启动器
        await context.hideLauncher();
      }
    },
  },
  {
    id: "show_plugin_list",
    name: "显示插件列表",
    description: "查看所有可用插件",
    keywords: [
      "显示插件列表",
      "插件列表",
      "插件",
      "列表",
      "所有插件",
      "xianshichajianliebiao",
      "xscjlb",
      "chajianliebiao",
      "cjlb",
      "chajian",
      "cj",
      "suoyouchajian",
      "sycj",
      "plugin",
    ],
    execute: async (context: PluginContext) => {
      // 打开独立的插件列表窗口
      if (context.tauriApi) {
        await context.tauriApi.showPluginListWindow();
        // 关闭启动器
        await context.hideLauncher();
      }
    },
  },
];

/**
 * 根据 ID 查找插件
 */
export function getPluginById(id: string): Plugin | undefined {
  return plugins.find((plugin) => plugin.id === id);
}

/**
 * 搜索插件（根据关键词匹配）
 */
export function searchPlugins(query: string): Plugin[] {
  const lower = query.toLowerCase();
  return plugins.filter(
    (plugin) =>
      plugin.name.toLowerCase().includes(lower) ||
      plugin.description?.toLowerCase().includes(lower) ||
      plugin.keywords.some((keyword) => keyword.toLowerCase().includes(lower))
  );
}

/**
 * 执行插件
 */
export async function executePlugin(
  pluginId: string,
  context: PluginContext
): Promise<void> {
  const plugin = getPluginById(pluginId);
  if (!plugin) {
    console.error(`Plugin not found: ${pluginId}`);
    return;
  }

  try {
    await plugin.execute(context);
  } catch (error) {
    console.error(`Failed to execute plugin ${pluginId}:`, error);
  }
}

