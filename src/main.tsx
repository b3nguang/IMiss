import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { getCurrentWindow } from "@tauri-apps/api/window";
import App from "./App";
import LauncherApp from "./LauncherApp";
import ShortcutsConfigApp from "./ShortcutsConfigApp";
import MemoApp from "./MemoApp";
import PluginListApp from "./PluginListApp";
import { initializePlugins } from "./plugins";
import "./styles.css";

// Determine which app to render based on window label
async function initApp() {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Root element not found!");
    return;
  }
  
  // 初始化插件系统（仅在 launcher 窗口初始化）
  try {
    const window = getCurrentWindow();
    const label = window.label;
    
    if (label === "launcher") {
      // 在启动器窗口初始化插件系统
      try {
        await initializePlugins();
      } catch (error) {
        console.error("Failed to initialize plugins:", error);
        // 继续渲染，使用后备插件
      }
    }
  } catch (error) {
    console.warn("Failed to get window label for plugin initialization:", error);
  }
  
  // 渲染应用
  try {
    const window = getCurrentWindow();
    const label = window.label;
    
    if (label === "launcher") {
      ReactDOM.createRoot(root).render(
        <StrictMode>
          <LauncherApp />
        </StrictMode>
      );
    } else if (label === "shortcuts-config") {
      ReactDOM.createRoot(root).render(
        <StrictMode>
          <ShortcutsConfigApp />
        </StrictMode>
      );
    } else if (label === "memo-window") {
      ReactDOM.createRoot(root).render(
        <StrictMode>
          <MemoApp />
        </StrictMode>
      );
    } else if (label === "plugin-list-window") {
      ReactDOM.createRoot(root).render(
        <StrictMode>
          <PluginListApp />
        </StrictMode>
      );
    } else {
      ReactDOM.createRoot(root).render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    }
  } catch (error: unknown) {
    console.error("Failed to get window label:", error);
    // Fallback to main app
    ReactDOM.createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}

// Initialize app (now async)
initApp().catch(console.error);
