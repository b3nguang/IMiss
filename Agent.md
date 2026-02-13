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

## 7. Safety Rules for Agents

- Do not run destructive commands (e.g. deleting files, resetting git state) unless user explicitly approves.
- Do not revert unrelated local changes.
- If unexpected modifications are detected, stop and ask the user.

## 8. Useful Commands Recap

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
