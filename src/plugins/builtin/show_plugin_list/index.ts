import type { PluginContext } from "../../../types";

export default async function execute(context: PluginContext) {
  // 打开独立的插件列表窗口
  if (context.tauriApi) {
    await context.tauriApi.showPluginListWindow();
    // 关闭启动器
    await context.hideLauncher();
  }
}

