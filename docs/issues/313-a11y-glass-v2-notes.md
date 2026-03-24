# Issue #313 — Accessibility (focus, keyboard, contrast)

Manual / heuristic notes for **Glass v2** (CinéConnectPlan §8). Not a formal WCAG audit.

## Keyboard & focus

- **`AppShell`**: first tab stop is **« Aller au contenu principal »** (skip link → `#main-content`). Main landmark uses `tabIndex={-1}` so the skip target can receive focus without entering the tab order twice.
- **`SidebarNav`**: all rail targets are real **`<Link>`** / **`<button>`** with **`aria-label`** (or visible text when expanded). **`aria-current="page"`** on the active route (and settings when on `/profile`).
- **Visible focus**: interactive controls use either:
  - **`focusVisibleRingClass`** — `ring-2` + `ring-offset-2` + `ring-offset-app-base` (main content), or
  - **`focusVisibleRingInsetClass`** — **`ring-inset`** so focus rings are not clipped by the sidebar’s overflow.
- **`glassInputClass`**: keeps border/ring on focus; adds a stronger **`focus-visible`** ring for keyboard users.
- **`navLinkOutlineClass`**: includes the same offset ring as other primary outline controls.

## Contrast (spot-check)

| Area | Finding |
|------|--------|
| **Movie hero — title / rating** | Rendered inside the **frosted glass** block with **`text-ink`** (`#fff` on ~6% white glass). With dark scrims behind the panel, **large text** is intended to meet **~4.5:1** for body-equivalent use. |
| **Movie hero — metadata** | **`text-ink-secondary`** (`zinc-400` on glass) is **secondary** copy (year, director, “Note moyenne”). Treat as **non-essential**; ratio vs glass may sit **near ~3:1**. **Known exception** unless bumped to a lighter secondary (e.g. `zinc-300`) later. |
| **Reduced transparency** (`prefers-reduced-transparency`) | Glass vars switch to **nearly opaque** zinc surfaces — **improves** contrast for frosted areas. |
| **Active nav (red on dark rail)** | **`accent-red`** on **`bg-app-base`** / glass — used for **active state** only per plan; spot-check in browser if badges overlap small targets. |

## Lighthouse / follow-up

- Run **Lighthouse** accessibility on `/`, `/movie/:id`, `/login`, and a shell page with sidebar.
- Revisit **`text-ink-muted`** on glass panels if any **small** text fails automated contrast (consider `text-zinc-300` for 12px hints only).
