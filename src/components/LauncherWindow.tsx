import { useState, useEffect, useRef } from "react";
import { tauriApi } from "../api/tauri";
import type { AppInfo } from "../types";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function LauncherWindow() {
  const [query, setQuery] = useState("");
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [filteredApps, setFilteredApps] = useState<AppInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load applications on mount - delay to avoid blocking UI
  useEffect(() => {
    // Don't auto-load on mount to avoid blocking startup
    // User can trigger scan manually or we can load on first search
    // const timer = setTimeout(() => {
    //   loadApplications();
    // }, 100);
    // 
    // return () => clearTimeout(timer);
  }, []);

  // Search applications when query changes
  useEffect(() => {
    if (query.trim() === "") {
      // Don't show anything when empty to avoid loading
      setFilteredApps([]);
      setSelectedIndex(0);
    } else {
      // Only search when user types something
      searchApplications(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.children;
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  // Focus input when window becomes visible
  useEffect(() => {
    const window = getCurrentWindow();
    const unlisten = window.onFocusChanged(({ payload: focused }) => {
      if (focused && inputRef.current) {
        inputRef.current.focus();
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Listen for Alt+Space globally (when window is focused)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Alt+Space to toggle launcher
      if (e.altKey && e.key === " ") {
        e.preventDefault();
        const window = getCurrentWindow();
        const isVisible = await window.isVisible();
        if (isVisible) {
          await window.hide();
        } else {
          await window.show();
          await window.setFocus();
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      // Use setTimeout to yield to the event loop and avoid blocking
      await new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            const allApps = await tauriApi.scanApplications();
            setApps(allApps);
            setFilteredApps(allApps.slice(0, 10));
          } catch (error) {
            console.error("Failed to load applications:", error);
            setApps([]);
            setFilteredApps([]);
          } finally {
            setIsLoading(false);
            resolve();
          }
        }, 0);
      });
    } catch (error) {
      console.error("Failed to load applications:", error);
      setApps([]);
      setFilteredApps([]);
      setIsLoading(false);
    }
  };

  const searchApplications = async (searchQuery: string) => {
    try {
      // If apps not loaded yet, load them first
      if (apps.length === 0 && !isLoading) {
        await loadApplications();
      }
      
      const results = await tauriApi.searchApplications(searchQuery);
      setFilteredApps(results.slice(0, 10)); // Limit to 10 results
      setSelectedIndex(0);
    } catch (error) {
      console.error("Failed to search applications:", error);
    }
  };

  const handleLaunch = async (app: AppInfo) => {
    try {
      await tauriApi.launchApplication(app);
      // Hide launcher window after launch
      const window = getCurrentWindow();
      await window.hide();
      setQuery("");
      setSelectedIndex(0);
    } catch (error) {
      console.error("Failed to launch application:", error);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      const window = getCurrentWindow();
      await window.hide();
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredApps.length - 1 ? prev + 1 : prev
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredApps[selectedIndex]) {
        await handleLaunch(filteredApps[selectedIndex]);
      }
      return;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200">
      {/* Search Box */}
      <div className="p-4 border-b border-gray-200">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索应用..."
          className="w-full px-4 py-3 text-lg border-none outline-none bg-transparent placeholder-gray-400"
          autoFocus
        />
      </div>

      {/* Results List */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-2"
        style={{ maxHeight: "400px" }}
      >
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">正在扫描应用...</div>
        ) : filteredApps.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {query ? "未找到匹配的应用" : "输入关键词搜索应用（首次搜索会扫描应用）"}
          </div>
        ) : (
          filteredApps.map((app, index) => (
            <div
              key={`${app.path}-${index}`}
              onClick={() => handleLaunch(app)}
              className={`px-4 py-3 rounded cursor-pointer transition-colors ${
                index === selectedIndex
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="font-medium">{app.name}</div>
              {app.path && (
                <div
                  className={`text-sm ${
                    index === selectedIndex ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {app.path}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>
          {filteredApps.length > 0
            ? `找到 ${filteredApps.length} 个结果`
            : ""}
        </span>
        <span>↑↓ 选择 | Enter 打开 | Esc 关闭</span>
      </div>
    </div>
  );
}

