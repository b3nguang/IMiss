import { useEffect } from "react";

/**
 * 通用的 Esc 键处理 Hook
 * @param onEscape - 按下 Esc 键时执行的回调函数
 * @param enabled - 是否启用（默认为 true）
 */
export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [onEscape, enabled]);
}
