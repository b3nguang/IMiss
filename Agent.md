# AGENT Guidelines for This Repository

This document follows the [agents.md](https://agents.md) style and is intended to guide coding agents working in this repository.

## 1. Project Overview

- App name: **ReFast**
- Stack: **Tauri 2 + React 18 + TypeScript + Vite + Rust**
- Frontend source: `src/`
- Tauri/Rust source: `src-tauri/`

## 2. Preferred Development Workflow

- Use `pnpm run dev:tauri` for end-to-end local development (frontend + Tauri shell).
- Use `pnpm run dev` only when you only need frontend iteration.
- Do **not** run release packaging commands unless explicitly requested.

## 3. Build & Run Policy

- Avoid `pnpm run build:tauri` during normal agent iterations.
- Run `pnpm run build` only when user asks for build verification.
- If dependencies change, keep lockfiles in sync (`package-lock.json` / `pnpm-lock.yaml`) and reinstall.

## 4. Testing & Validation

Before finishing a code task, prefer the smallest relevant validation:

1. Targeted tests first (`vitest` with related scope when possible).
2. Then full tests if required:
   - `pnpm run test`
   - `pnpm run test:coverage` (only when explicitly requested)

## 5. Coding Conventions

- Prefer **TypeScript** for frontend code.
- Follow existing style; keep changes minimal and focused.
- Avoid broad refactors unless requested.
- Do not hardcode secrets, tokens, or machine-specific absolute paths.
- Keep imports at file top and keep comments concise.

## 6. Tauri / Rust Conventions

- Keep platform-specific logic behind appropriate `#[cfg(...)]` guards.
- Prefer root-cause fixes over workarounds.
- Add logs only when useful for debugging, and avoid noisy output.

## 7. UI Design: Material Design 3 (MD3)

LauncherWindow 已采用 [Material Design 3](https://m3.material.io/) 设计规范，后续 UI 修改应遵循以下约定：

### 7.1 Design Tokens

所有 M3 色彩、阴影、圆角、状态层均定义为 CSS 变量，位于 `src/styles.css` 的 `:root` 中：

- **色彩**：`--md-sys-color-primary`、`--md-sys-color-surface`、`--md-sys-color-on-*` 等，遵循 M3 的 primary / secondary / tertiary / error / surface 体系。
- **阴影**：`--md-sys-elevation-1` ~ `--md-sys-elevation-5`，对应 M3 的 5 级 elevation。
- **圆角**：`--md-sys-shape-corner-*`（extra-small 4px → extra-large 28px → full 9999px）。
- **状态层**：`.m3-state-layer` 类提供 hover 8% / pressed 12% 的透明度叠加效果。

如需更换主色调，只需修改 `:root` 中的 CSS 变量，无需改动组件代码。

### 7.2 主题架构

- 主题配置集中在 `src/utils/themeConfig.ts`，通过 `ResultStyle` 类型区分风格。
- 当前支持 4 种风格：`"m3"` | `"compact"` | `"soft"` | `"skeuomorphic"`，默认为 `"m3"`。
- `getThemeConfig(style)` 返回卡片、徽章、文字等样式函数。
- `getLayoutConfig(style)` 返回容器、头部、输入框等布局类名。

### 7.3 M3 关键设计原则

- **Surface 层级**：使用 `surface-container-lowest` → `surface-container-highest` 表达层次，而非硬编码灰色。
- **圆角**：容器用 extra-large (28px)，卡片用 medium (12px)，按钮/标签用 full (pill)。
- **无硬边框**：优先用 elevation 阴影 + 微弱 outline-variant 边框，避免粗实线。
- **状态反馈**：选中项使用 `secondary-container` 背景 + `primary` 指示条，而非纯色高亮。
- **按钮**：状态栏按钮使用 rounded-full pill 形状，主操作用 primary 色，次操作用 surface-container-highest。

### 7.4 新增/修改 UI 时的检查清单

1. 颜色是否使用了 `var(--md-sys-color-*)` 而非硬编码 hex/tailwind 色值？
2. 圆角是否使用了 `var(--md-sys-shape-corner-*)` 而非固定 px？
3. 交互元素是否有 hover/pressed 状态反馈？
4. 是否通过 `isM3(resultStyle)` 做了条件分支，保持旧主题兼容？

## 8. Safety Rules for Agents

- Do not run destructive commands (e.g. deleting files, resetting git state) unless user explicitly approves.
- Do not revert unrelated local changes.
- If unexpected modifications are detected, stop and ask the user.

## 9. Useful Commands Recap

| Command | Purpose |
|---|---|
| `pnpm run dev` | Start Vite frontend dev server |
| `pnpm run dev:tauri` | Start full Tauri development |
| `pnpm run test` | Run test suite once |
| `pnpm run test:watch` | Run tests in watch mode |
| `pnpm run build` | Build frontend (TypeScript + Vite) |
| `pnpm run build:tauri` | Package desktop app (use only when requested) |

---

If uncertain, prioritize minimal, reversible changes and ask for clarification before broad updates.
