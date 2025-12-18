import type { PluginContext } from "../../../types";

export default async function execute(context: PluginContext) {
  // 打开独立的 ASCII 十六进制转换器窗口
  if (context.tauriApi) {
    await context.tauriApi.showHexConverterWindow();
    // 关闭启动器
    await context.hideLauncher();
  }
}
