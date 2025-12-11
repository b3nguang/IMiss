import { useState, useEffect, useRef } from "react";
import type { AppInfo, FileHistoryItem, EverythingResult, MemoItem, SystemFolderItem } from "../types";
import type { ThemeConfig, ResultStyle } from "../utils/themeConfig";
import { isFolderLikePath } from "../utils/launcherUtils";
import { tauriApi } from "../api/tauri";

// 规范化路径用于比较（大小写不敏感，统一路径分隔符）
const normalizePathForComparison = (path: string): string => {
  return path.toLowerCase().replace(/\\/g, "/");
};

type SearchResult = {
  type: "app" | "file" | "everything" | "url" | "email" | "memo" | "plugin" | "system_folder" | "history" | "ai" | "json_formatter" | "settings";
  app?: AppInfo;
  file?: FileHistoryItem;
  everything?: EverythingResult;
  url?: string;
  email?: string;
  memo?: MemoItem;
  plugin?: { id: string; name: string; description?: string };
  systemFolder?: SystemFolderItem;
  aiAnswer?: string;
  jsonContent?: string;
  displayName: string;
  path: string;
};

interface ResultIconProps {
  result: SearchResult;
  isSelected: boolean;
  theme: ThemeConfig;
  apps: AppInfo[];
  filteredApps: AppInfo[];
  resultStyle: ResultStyle;
  getPluginIcon: (pluginId: string, className: string) => JSX.Element;
  size?: "horizontal" | "vertical";
}

/**
 * 结果项图标组件
 * 统一处理所有类型结果的图标渲染逻辑
 */
export function ResultIcon({
  result,
  isSelected,
  theme,
  apps,
  filteredApps,
  resultStyle,
  getPluginIcon,
  size = "vertical",
}: ResultIconProps) {
  // 根据 size 确定图标大小
  const getIconSize = () => {
    if (size === "horizontal") {
      return isSelected ? "w-9 h-9" : "w-7 h-7";
    }
    // vertical
    if (result.type === "app") {
      return "w-8 h-8";
    }
    return "w-5 h-5";
  };

  const iconSize = getIconSize();
  
  // 用于存储动态提取的图标（适用于 file、everything、system_folder 类型的 .lnk/.exe 文件）
  const [extractedFileIcon, setExtractedFileIcon] = useState<string | null>(null);
  const previousFilePathRef = useRef<string>("");
  
  // 检查是否是 .lnk 或 .exe 文件，且需要提取图标
  const filePath = result.path || "";
  const isLnkOrExe = filePath.toLowerCase().endsWith(".lnk") || filePath.toLowerCase().endsWith(".exe");
  const isFileTypeNeedingIcon = (result.type === "file" || result.type === "everything" || result.type === "system_folder") && isLnkOrExe;
  
  // #region agent log - 只记录 MSYS2 相关的结果
  if (filePath.includes('MSYS2') || result.displayName.includes('MSYS2')) {
    fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:67',message:'ResultIcon render - MSYS2 file',data:{resultType:result.type,filePath:filePath,isLnkOrExe:isLnkOrExe,isFileTypeNeedingIcon:isFileTypeNeedingIcon,displayName:result.displayName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion
  
  // 当 filePath 改变时，重置提取的图标
  useEffect(() => {
    if (previousFilePathRef.current !== filePath) {
      // #region agent log - 只记录 MSYS2 相关
      if (filePath.includes('MSYS2')) {
        fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:75',message:'File path changed - resetting icon',data:{previousPath:previousFilePathRef.current,newPath:filePath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      previousFilePathRef.current = filePath;
      setExtractedFileIcon(null);
    }
  }, [filePath]);
  
  // 对于 file、everything、system_folder 类型的 .lnk/.exe 文件，如果没有图标，尝试动态提取
  useEffect(() => {
    // #region agent log - 只记录 MSYS2 相关
    if (filePath.includes('MSYS2')) {
      fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:82',message:'useEffect for icon extraction - entry',data:{isFileTypeNeedingIcon:isFileTypeNeedingIcon,extractedFileIcon:extractedFileIcon,filePath:filePath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    }
    // #endregion
    if (isFileTypeNeedingIcon && !extractedFileIcon && filePath) {
      // 先检查是否在应用列表中有图标（使用规范化路径比较）
      const normalizedFilePath = normalizePathForComparison(filePath);
      const matchedApp = filteredApps.find((app) => normalizePathForComparison(app.path) === normalizedFilePath) || 
                         apps.find((app) => normalizePathForComparison(app.path) === normalizedFilePath);
      // #region agent log - 只记录 MSYS2 相关
      if (filePath.includes('MSYS2')) {
        fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:87',message:'Checking app list for icon',data:{filePath:filePath,matchedAppFound:!!matchedApp,matchedAppIcon:matchedApp?.icon ? 'exists' : 'null',filteredAppsCount:filteredApps.length,appsCount:apps.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      }
      // #endregion
      if (!matchedApp || !matchedApp.icon) {
        // 如果应用列表中没有图标，尝试动态提取
        // #region agent log - 只记录 MSYS2 相关
        if (filePath.includes('MSYS2')) {
          fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:91',message:'Calling extractIconFromPath',data:{filePath:filePath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        }
        // #endregion
        tauriApi.extractIconFromPath(filePath)
          .then((icon) => {
            // #region agent log - 只记录 MSYS2 相关
            if (filePath.includes('MSYS2')) {
              fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:95',message:'extractIconFromPath success',data:{filePath:filePath,iconReceived:!!icon,iconLength:icon?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            }
            // #endregion
            if (icon) {
              setExtractedFileIcon(icon);
            }
          })
          .catch((error) => {
            // #region agent log - 只记录 MSYS2 相关
            if (filePath.includes('MSYS2')) {
              fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:100',message:'extractIconFromPath error',data:{filePath:filePath,error:error?.message || String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            }
            // #endregion
            // 忽略错误，使用默认图标
          });
      }
    }
  }, [isFileTypeNeedingIcon, extractedFileIcon, filePath, filteredApps, apps]);

  // 处理应用图标
  if (result.type === "app") {
    // 检查是否是 Windows 设置应用，如果是则使用齿轮图标
    const appName = (result.app?.name || result.displayName || '').toLowerCase();
    const appPath = (result.path || '').toLowerCase();
    // 只对名称是"设置"/"Settings"或路径是ms-settings:的应用使用齿轮图标
    // 不要对所有shell:appsfolder路径使用齿轮图标（因为所有UWP应用都是这个路径）
    const isSettingsApp = (appName === '设置' || appName === 'settings') || 
                         appPath.startsWith('ms-settings:');
    
    if (isSettingsApp) {
      // Windows 设置应用使用齿轮图标
      const className = size === "horizontal"
        ? `${isSelected ? "w-9 h-9" : "w-7 h-7"} ${isSelected 
            ? (resultStyle === "soft" ? "text-blue-600" : resultStyle === "skeuomorphic" ? "text-[#4a6fa5]" : "text-indigo-600")
            : (resultStyle === "skeuomorphic" ? "text-gray-700" : "text-gray-600")}`
        : `${iconSize} ${theme.iconColor(isSelected, "text-gray-600")}`;
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    }
    
    // 检查是否是计算器应用，如果是则使用计算器图标
    const isCalculatorApp = (appName === '计算器' || appName === 'calculator') ||
                           appPath.includes('calculator') ||
                           appPath.includes('windows.calculator');
    
    if (isCalculatorApp) {
      // 计算器应用使用计算器图标
      const className = size === "horizontal"
        ? `${isSelected ? "w-9 h-9" : "w-7 h-7"} ${isSelected 
            ? (resultStyle === "soft" ? "text-blue-600" : resultStyle === "skeuomorphic" ? "text-[#4a6fa5]" : "text-indigo-600")
            : (resultStyle === "skeuomorphic" ? "text-gray-700" : "text-gray-600")}`
        : `${iconSize} ${theme.iconColor(isSelected, "text-gray-600")}`;
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }
    
    let iconToUse = result.app?.icon;
    // 检查图标数据是否有效（不是空字符串）
    if (iconToUse && iconToUse.trim() === '') {
      iconToUse = undefined;
    }
    // #region agent log - 只记录 MSYS2 相关
    if (result.path.includes('MSYS2')) {
      fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:181',message:'App type - initial iconToUse check',data:{path:result.path,resultAppIcon:result.app?.icon ? 'exists' : 'null',iconToUseAfterCheck:iconToUse ? 'exists' : 'null',iconLength:iconToUse?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    }
    // #endregion
    if (!iconToUse && result.path) {
      const normalizedResultPath = normalizePathForComparison(result.path);
      const matchedApp = apps.find((app) => normalizePathForComparison(app.path) === normalizedResultPath);
      // #region agent log - 只记录 MSYS2 相关
      if (result.path.includes('MSYS2')) {
        fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:186',message:'App type - checking apps list',data:{path:result.path,matchedAppFound:!!matchedApp,matchedAppIcon:matchedApp?.icon ? 'exists' : 'null',appsCount:apps.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      }
      // #endregion
      if (matchedApp && matchedApp.icon) {
        iconToUse = matchedApp.icon;
      } else {
        // 如果 apps 中找不到，尝试从 filteredApps 中查找
        const matchedFilteredApp = filteredApps.find((app) => normalizePathForComparison(app.path) === normalizedResultPath);
        // #region agent log - 只记录 MSYS2 相关
        if (result.path.includes('MSYS2')) {
          fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:192',message:'App type - checking filteredApps list',data:{path:result.path,matchedFilteredAppFound:!!matchedFilteredApp,matchedFilteredAppIcon:matchedFilteredApp?.icon ? 'exists' : 'null',filteredAppsCount:filteredApps.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
        }
        // #endregion
        if (matchedFilteredApp && matchedFilteredApp.icon) {
          iconToUse = matchedFilteredApp.icon;
        }
      }
    }

    // 如果仍然找不到图标，且路径是 .exe 或 .lnk 文件，尝试动态提取图标
    const [extractedIcon, setExtractedIcon] = useState<string | null>(null);
    const pathLower = (result.path || '').toLowerCase();
    const isExeOrLnk = pathLower.endsWith('.exe') || pathLower.endsWith('.lnk');
    
    // #region agent log - 只记录 MSYS2 相关
    if (result.path.includes('MSYS2')) {
      fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:202',message:'App type - before useEffect',data:{path:result.path,iconToUse:iconToUse ? 'exists' : 'null',extractedIcon:extractedIcon ? 'exists' : 'null',isExeOrLnk:isExeOrLnk},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    }
    // #endregion
    
    useEffect(() => {
      // 在 useEffect 内部重新计算 iconToUse，因为它在渲染时计算，不应该作为依赖项
      let currentIconToUse = result.app?.icon;
      // 检查图标数据是否有效（不是空字符串）
      if (currentIconToUse && currentIconToUse.trim() === '') {
        currentIconToUse = undefined;
      }
      if (!currentIconToUse && result.path) {
        const normalizedResultPath = normalizePathForComparison(result.path);
        const matchedApp = apps.find((app) => normalizePathForComparison(app.path) === normalizedResultPath);
        if (matchedApp && matchedApp.icon) {
          currentIconToUse = matchedApp.icon;
        } else {
          const matchedFilteredApp = filteredApps.find((app) => normalizePathForComparison(app.path) === normalizedResultPath);
          if (matchedFilteredApp && matchedFilteredApp.icon) {
            currentIconToUse = matchedFilteredApp.icon;
          }
        }
      }
      
      // #region agent log - 只记录 MSYS2 相关
      if (result.path.includes('MSYS2')) {
        fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:217',message:'App type - useEffect entry',data:{path:result.path,currentIconToUse:currentIconToUse ? 'exists' : 'null',extractedIcon:extractedIcon ? 'exists' : 'null',isExeOrLnk:isExeOrLnk},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      }
      // #endregion
      
      if (!currentIconToUse && !extractedIcon && result.path && isExeOrLnk) {
        // #region agent log - 只记录 MSYS2 相关
        if (result.path.includes('MSYS2')) {
          fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:225',message:'App type - Calling extractIconFromPath',data:{path:result.path,currentIconToUse:currentIconToUse ? 'exists' : 'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
        }
        // #endregion
        tauriApi.extractIconFromPath(result.path)
          .then((icon) => {
            // #region agent log - 只记录 MSYS2 相关
            if (result.path.includes('MSYS2')) {
              fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:231',message:'App type - extractIconFromPath success',data:{path:result.path,iconReceived:!!icon,iconLength:icon?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
            }
            // #endregion
            if (icon) {
              setExtractedIcon(icon);
            }
          })
          .catch((error) => {
            // #region agent log - 只记录 MSYS2 相关
            if (result.path.includes('MSYS2')) {
              fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:239',message:'App type - extractIconFromPath error',data:{path:result.path,error:error?.message || String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
            }
            // #endregion
            // 忽略错误，使用默认图标
          });
      }
    }, [extractedIcon, result.path, result.app?.icon, apps, filteredApps, isExeOrLnk]);

    // 使用提取的图标（如果可用）
    if (!iconToUse && extractedIcon) {
      iconToUse = extractedIcon;
    }
    
    // #region agent log - 只记录 MSYS2 相关
    if (result.path.includes('MSYS2')) {
      const iconPreview = iconToUse ? (iconToUse.startsWith('data:') ? iconToUse.substring(0, 50) + '...' : iconToUse.substring(0, 50)) : 'null';
      fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:238',message:'App type - final iconToUse check',data:{path:result.path,iconToUse:iconToUse ? 'exists' : 'null',iconPreview:iconPreview,iconLength:iconToUse?.length || 0,extractedIcon:extractedIcon ? 'exists' : 'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    }
    // #endregion

    if (iconToUse) {
      return (
        <img
          src={iconToUse}
          alt={result.displayName}
          className={`${iconSize} object-contain`}
          style={{ imageRendering: "auto" as const }}
          ref={(img) => {
            // #region agent log - 只记录 MSYS2 相关
            if (result.path.includes('MSYS2') && img) {
              setTimeout(() => {
                const rect = img.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(img);
                const parent = img.parentElement;
                const parentRect = parent ? parent.getBoundingClientRect() : null;
                const parentStyle = parent ? window.getComputedStyle(parent) : null;
                fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:297',message:'App type - Image ref callback with parent',data:{path:result.path,imgWidth:rect.width,imgHeight:rect.height,imgDisplay:computedStyle.display,imgVisibility:computedStyle.visibility,imgOpacity:computedStyle.opacity,imgClassName:img.className,parentWidth:parentRect?.width,parentHeight:parentRect?.height,parentDisplay:parentStyle?.display,parentVisibility:parentStyle?.visibility,parentOverflow:parentStyle?.overflow,parentClassName:parent?.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
              }, 100);
            }
            // #endregion
          }}
          onError={(e) => {
            // #region agent log - 只记录 MSYS2 相关
            if (result.path.includes('MSYS2')) {
              fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:310',message:'App type - Image load error',data:{path:result.path,iconSrc:iconToUse.substring(0, 100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
            }
            // #endregion
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent && !parent.querySelector("svg")) {
              const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              const fallbackSize = size === "horizontal" 
                ? (isSelected ? "w-7 h-7" : "w-5 h-5")
                : "w-5 h-5";
              const fallbackColor = size === "horizontal"
                ? (isSelected ? "text-white" : "text-gray-500")
                : (isSelected ? "text-white" : "text-gray-500");
              svg.setAttribute("class", `${fallbackSize} ${fallbackColor}`);
              svg.setAttribute("fill", "none");
              svg.setAttribute("stroke", "currentColor");
              svg.setAttribute("viewBox", "0 0 24 24");
              const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
              path.setAttribute("stroke-linecap", "round");
              path.setAttribute("stroke-linejoin", "round");
              path.setAttribute("stroke-width", "2");
              // 根据 size 使用不同的 fallback 图标
              if (size === "horizontal") {
                path.setAttribute("d", "M4 6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6z");
              } else {
                path.setAttribute("d", "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z");
              }
              svg.appendChild(path);
              parent.appendChild(svg);
            }
          }}
          onLoad={() => {
            // #region agent log - 只记录 MSYS2 相关
            if (result.path.includes('MSYS2')) {
              const img = document.querySelector(`img[alt="${result.displayName}"]`) as HTMLImageElement;
              if (img) {
                const rect = img.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(img);
                fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:345',message:'App type - Image load success with dimensions',data:{path:result.path,width:rect.width,height:rect.height,display:computedStyle.display,visibility:computedStyle.visibility,opacity:computedStyle.opacity},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
              }
            }
            // #endregion
          }}
        />
      );
    } else {
      // 应用类型但没有图标，显示占位图标
      const className = size === "horizontal"
        ? `${isSelected ? "w-7 h-7" : "w-5 h-5"} ${isSelected ? "text-white" : "text-gray-500"}`
        : `w-5 h-5 ${theme.iconColor(isSelected, "text-gray-500")}`;
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h8m-8 4h5m-5-7h.01"
          />
        </svg>
      );
    }
  }

  // 处理插件图标
  if (result.type === "plugin" && result.plugin) {
    const className = size === "horizontal"
      ? `${isSelected ? "w-7 h-7" : "w-5 h-5"} ${isSelected 
          ? (resultStyle === "soft" ? "text-blue-600" : resultStyle === "skeuomorphic" ? "text-[#4a6fa5]" : "text-indigo-600")
          : "text-purple-500"}`
      : `w-5 h-5 ${theme.iconColor(isSelected, "text-purple-500")}`;
    return getPluginIcon(result.plugin.id, className);
  }

  // 处理 URL 图标
  if (result.type === "url") {
    return (
      <svg className={`w-5 h-5 ${theme.iconColor(isSelected, "text-blue-500")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    );
  }

  // 处理邮箱图标
  if (result.type === "email") {
    return (
      <svg className={`w-5 h-5 ${theme.iconColor(isSelected, "text-green-500")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );
  }

  // 处理备忘录图标
  if (result.type === "memo") {
    return (
      <svg className={`w-5 h-5 ${theme.iconColor(isSelected, "text-purple-500")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  }

  // 处理历史记录图标
  if (result.type === "history") {
    return (
      <svg className={`w-5 h-5 ${theme.iconColor(isSelected, "text-orange-500")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>
    );
  }

  // 处理设置图标
  if (result.type === "settings") {
    const className = size === "horizontal"
      ? `${isSelected ? "w-9 h-9" : "w-7 h-7"} ${isSelected 
          ? (resultStyle === "soft" ? "text-white" : resultStyle === "skeuomorphic" ? "text-white" : "text-indigo-600")
          : (resultStyle === "skeuomorphic" ? "text-gray-700" : "text-gray-600")}`
      : `${iconSize} ${theme.iconColor(isSelected, "text-gray-600")}`;
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    );
  }

  // 处理 AI 图标
  if (result.type === "ai") {
    return (
      <svg className={`w-5 h-5 ${theme.iconColor(isSelected, "text-blue-500")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
      </svg>
    );
  }

  // 处理 JSON 格式化器图标
  if (result.type === "json_formatter") {
    return (
      <svg className={`w-5 h-5 ${theme.iconColor(isSelected, "text-indigo-500")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    );
  }

  // 处理系统文件夹：回收站显示垃圾桶图标
  if (result.type === "system_folder" && result.systemFolder) {
    const folderName = result.systemFolder.name || "";
    // 检查是否是回收站（支持中文和英文名称）
    if (folderName === "回收站" || folderName.toLowerCase().includes("recycle")) {
      return (
        <svg
          className={`${iconSize} ${theme.iconColor(isSelected, "text-gray-600")}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      );
    }
  }

  // 处理文件夹（系统文件夹、文件历史、Everything 结果）
  const isFolder =
    (result.type === "system_folder" && result.systemFolder?.is_folder) ||
    (result.type === "file" &&
      ((result.file?.is_folder ?? null) !== null ? !!result.file?.is_folder : isFolderLikePath(result.path))) ||
    (result.type === "everything" &&
      ((result.everything?.is_folder ?? null) !== null ? !!result.everything?.is_folder : isFolderLikePath(result.path)));

  if (isFolder) {
    return (
      <svg
        className={`w-5 h-5 ${theme.iconColor(isSelected, "text-amber-500")}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
        />
      </svg>
    );
  }

  // 处理文件（file、everything、system_folder 但不是文件夹的情况）
  if (result.type === "file" || result.type === "everything" || result.type === "system_folder") {
    const filePath = result.path || "";
    const isLnkOrExe = filePath.toLowerCase().endsWith(".lnk") || filePath.toLowerCase().endsWith(".exe");
    
    // #region agent log - 只记录 MSYS2 相关
    if (filePath.includes('MSYS2')) {
      fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:433',message:'Rendering file/everything/system_folder icon',data:{resultType:result.type,filePath:filePath,isLnkOrExe:isLnkOrExe,extractedFileIcon:extractedFileIcon ? 'exists' : 'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    }
    // #endregion
    
    if (isLnkOrExe) {
      // 尝试在应用列表中查找匹配的应用（通过规范化路径匹配）
      const normalizedFilePath = normalizePathForComparison(filePath);
      let matchedApp = filteredApps.find((app) => normalizePathForComparison(app.path) === normalizedFilePath);
      if (!matchedApp || !matchedApp.icon) {
        // 如果 filteredApps 中找不到，尝试从 apps 中查找
        matchedApp = apps.find((app) => normalizePathForComparison(app.path) === normalizedFilePath);
      }
      
      // 优先使用应用列表中的图标，如果没有则使用动态提取的图标
      const iconToUse = matchedApp?.icon || extractedFileIcon;
      
      // #region agent log - 只记录 MSYS2 相关
      if (filePath.includes('MSYS2')) {
        fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:445',message:'Icon selection for lnk/exe file',data:{filePath:filePath,matchedAppIcon:matchedApp?.icon ? 'exists' : 'null',extractedFileIcon:extractedFileIcon ? 'exists' : 'null',iconToUse:iconToUse ? 'exists' : 'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      }
      // #endregion
      
      if (iconToUse) {
        return (
          <img
            src={iconToUse}
            alt={result.displayName}
            className="w-8 h-8 object-contain"
            style={{ imageRendering: "auto" as const }}
            onError={(e) => {
              // #region agent log - 只记录 MSYS2 相关
              if (filePath.includes('MSYS2')) {
                fetch('http://127.0.0.1:7242/ingest/7b6f7af1-8135-4973-8f41-60f30b037947',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ResultIcon.tsx:454',message:'Image load error',data:{filePath:filePath,iconSrc:iconToUse.substring(0,50)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
              }
              // #endregion
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent && !parent.querySelector("svg")) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("class", `w-5 h-5 ${isSelected ? "text-white" : "text-gray-500"}`);
                svg.setAttribute("fill", "none");
                svg.setAttribute("stroke", "currentColor");
                svg.setAttribute("viewBox", "0 0 24 24");
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("stroke-linecap", "round");
                path.setAttribute("stroke-linejoin", "round");
                path.setAttribute("stroke-width", "2");
                path.setAttribute("d", "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z");
                svg.appendChild(path);
                parent.appendChild(svg);
              }
            }}
          />
        );
      }
    }
    
    // 默认显示文档图标
    return (
      <svg className={`w-5 h-5 ${theme.iconColor(isSelected, "text-gray-500")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  }

  // 默认图标
  return (
    <svg className={`w-5 h-5 ${theme.iconColor(isSelected, "text-gray-500")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

