# ReFast

<div align="center">
  <h3>基于 Tauri 2 的 Windows 快速启动器</h3>
  <p>类似 utools，让你快速启动应用、搜索文件、管理备忘录</p>
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
    <a href="https://github.com/Xieweikang123/ReFast/releases"><img src="https://img.shields.io/github/v/release/Xieweikang123/ReFast" alt="Release"></a>
    <a href="https://github.com/Xieweikang123/ReFast"><img src="https://img.shields.io/github/stars/Xieweikang123/ReFast?style=social" alt="Stars"></a>
  </p>
</div>

## 📥 下载

从 [Releases](https://github.com/Xieweikang123/ReFast/releases) 页面下载最新版本的安装包。

## 技术栈

- **框架**: Tauri 2.x
- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Rust
- **平台**: Windows

## 项目结构

```
re-fast/
├── src/                    # 前端代码
│   ├── api/               # Tauri API 封装
│   ├── components/        # React 组件
│   ├── types/             # TypeScript 类型定义
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 入口文件
├── src-tauri/             # Tauri 后端代码
│   ├── src/
│   │   ├── commands.rs    # Tauri 命令定义
│   │   ├── launcher.rs    # 启动器核心功能
│   │   ├── hotkey.rs      # 全局快捷键
│   │   ├── everything_search.rs  # Everything 搜索集成
│   │   ├── app_search.rs  # 应用搜索
│   │   ├── memos.rs       # 备忘录功能
│   │   ├── error.rs       # 错误处理
│   │   └── main.rs        # 应用入口
│   └── Cargo.toml         # Rust 依赖配置
└── package.json           # 前端依赖配置
```

## 开发

### 前置要求

- Node.js (v18+)
- Rust (最新稳定版)
- Windows 10/11 开发环境

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev:tauri
```

### 构建

```bash
npm run build:tauri
```

## 功能特性

### 核心功能
- 🚀 **快速启动器** - 通过全局快捷键快速呼出，支持应用、文件、备忘录搜索
- 🔍 **智能搜索** - 集成 Everything 搜索，支持应用搜索、文件历史、系统文件夹搜索
- 📝 **备忘录中心** - 快速记录和检索备忘信息
- 🔧 **插件系统** - 支持自定义插件扩展功能
- ⌨️ **全局快捷键** - 自定义快捷键配置
- 🎨 **现代化 UI** - 基于 React + Tailwind CSS 的优雅界面
- ⚡ **性能优秀** - 基于 Rust + Tauri 2，资源占用极低

### 内置工具
- JSON 格式化工具
- 插件管理界面
- 设置中心

## 功能状态

### 已完成
- ✅ 快速启动器核心功能
- ✅ 应用搜索和启动
- ✅ Everything 搜索集成
- ✅ 文件历史记录
- ✅ 备忘录功能
- ✅ 全局快捷键支持
- ✅ 插件系统框架
- ✅ JSON 格式化工具
- ✅ 现代化 UI 界面

### 计划中
- ⏳ 更多内置插件
- ⏳ 主题自定义
- ⏳ 搜索历史优化
- ⏳ 更多文件类型支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- [GitHub 仓库](https://github.com/Xieweikang123/ReFast)
- [问题反馈](https://github.com/Xieweikang123/ReFast/issues)
- [Tauri 官网](https://tauri.app/)






