import { useState, useEffect, useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { confirm } from "@tauri-apps/plugin-dialog";
import { tauriApi } from "../api/tauri";
import type { WordRecord } from "../types";

export function WordRecordWindow() {
  const [wordRecords, setWordRecords] = useState<WordRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadWordRecords = async () => {
    setIsLoading(true);
    try {
      const list = await tauriApi.getAllWordRecords();
      setWordRecords(list);
    } catch (error) {
      console.error("Failed to load word records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadWordRecords();
      return;
    }
    setIsLoading(true);
    try {
      const results = await tauriApi.searchWordRecords(searchQuery.trim());
      setWordRecords(results);
    } catch (error) {
      console.error("Failed to search word records:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const handleDelete = async (id: string, word: string) => {
    const confirmed = await confirm(
      `确定要删除单词 "${word}" 吗？`,
      { title: "确认删除", kind: "warning" }
    );
    if (confirmed) {
      try {
        await tauriApi.deleteWordRecord(id);
        await loadWordRecords();
      } catch (error) {
        console.error("Failed to delete word record:", error);
        alert("删除失败：" + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleClose = useCallback(async () => {
    const window = getCurrentWindow();
    await window.close();
  }, []);

  useEffect(() => {
    loadWordRecords();
  }, []);

  // ESC 键处理
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        await handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [handleClose]);

  // 搜索输入框回车处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
        handleSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchQuery, handleSearch]);

  const formatDate = (timestamp: number | undefined | null) => {
    if (!timestamp || timestamp <= 0) {
      return "未知时间";
    }
    try {
      // 如果时间戳小于 10^10，说明是秒级时间戳，需要乘以 1000
      // 如果时间戳大于 10^10，说明是毫秒级时间戳，直接使用
      const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
      const date = new Date(timestampMs);
      if (isNaN(date.getTime())) {
        return "无效时间";
      }
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "无效时间";
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">单词本</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={loadWordRecords}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title="刷新"
          >
            刷新
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索单词或翻译..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            搜索
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                loadWordRecords();
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* Word Records List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : wordRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-4xl mb-4">📚</div>
            <div className="text-lg mb-2">暂无单词记录</div>
            <div className="text-sm">在翻译工具中保存单词后，会显示在这里</div>
          </div>
        ) : (
          <div className="space-y-3">
            {wordRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {record.word}
                      </h3>
                      {record.phonetic && (
                        <span className="text-sm text-gray-500">
                          [{record.phonetic}]
                        </span>
                      )}
                      {record.isFavorite && (
                        <span className="text-yellow-500">⭐</span>
                      )}
                      {record.isMastered && (
                        <span className="text-green-500 text-sm">✓ 已掌握</span>
                      )}
                    </div>
                    <div className="text-gray-700 mb-2">{record.translation}</div>
                    {record.context && (
                      <div className="text-sm text-gray-500 mb-2 italic">
                        {record.context}
                      </div>
                    )}
                    {record.exampleSentence && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">例句：</span>
                        {record.exampleSentence}
                      </div>
                    )}
                    {record.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {record.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>
                        {record.sourceLang} → {record.targetLang}
                      </span>
                      <span>掌握程度: {record.masteryLevel}/5</span>
                      <span>复习次数: {record.reviewCount}</span>
                      <span>{formatDate(record.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(record.id, record.word)}
                    className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

