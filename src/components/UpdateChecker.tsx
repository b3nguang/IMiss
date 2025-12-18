import { useEffect, useState, useCallback } from "react";
import { tauriApi } from "../api/tauri";
import type { UpdateCheckResult } from "../types";

interface UpdateCheckerProps {
  autoCheck?: boolean;
  checkInterval?: number; // 检查间隔（小时），默认 24 小时
  onUpdateFound?: (updateInfo: UpdateCheckResult) => void;
}

/**
 * 更新检查组件
 * 支持自动检查和手动检查
 * 不显示弹窗，通过回调函数通知父组件
 */
export function UpdateChecker({
  autoCheck = true,
  checkInterval = 24,
  onUpdateFound,
}: UpdateCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<number | null>(null);

  // 检查更新
  const checkUpdate = useCallback(async () => {
    // 防止重复检查
    if (isChecking) {
      return;
    }

    setIsChecking(true);
    try {
      const result = await tauriApi.checkUpdate();
      setLastCheckTime(Date.now());

      if (result.has_update) {
        if (onUpdateFound) {
          onUpdateFound(result);
        }
      }
    } catch (error) {
      console.error("检查更新失败:", error);
      // 静默失败，不打扰用户
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, onUpdateFound]);

  // 自动检查更新
  useEffect(() => {
    if (!autoCheck) {
      return;
    }

    // 从 localStorage 读取上次检查时间
    const storedLastCheck = localStorage.getItem("last_update_check_time");
    const storedLastCheckTime = storedLastCheck ? parseInt(storedLastCheck, 10) : null;

    // 检查是否需要更新（距离上次检查超过指定间隔）
    const shouldCheck = !storedLastCheckTime || 
      (Date.now() - storedLastCheckTime) > (checkInterval * 60 * 60 * 1000);

    if (shouldCheck) {
      // 延迟 5 秒检查，避免影响启动速度
      const timer = setTimeout(() => {
        checkUpdate();
      }, 5000);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCheck, checkInterval]);

  // 保存检查时间到 localStorage
  useEffect(() => {
    if (lastCheckTime !== null) {
      localStorage.setItem("last_update_check_time", lastCheckTime.toString());
    }
  }, [lastCheckTime]);

  // 不渲染任何 UI，只负责检查逻辑
  return null;
}

// 导出手动检查函数供外部调用
export const checkUpdateManually = async (): Promise<UpdateCheckResult | null> => {
  try {
    const result = await tauriApi.checkUpdate();
    return result;
  } catch (error) {
    console.error("手动检查更新失败:", error);
    return null;
  }
};
