# Glass streaming UI — GitHub issue breakdown

**Source plan:** [CinéConnectPlan.md](./CinéConnectPlan.md)  
**Suggested label:** `frontend`, `ui`, `design-v2` (create on GitHub if missing)

**Total issues:** **13** (11 core + 2 optional)  
**Suggested order:** follow issue numbers; **#1 → #3** before any page migration.

---

## Summary

| # | Issue (title) | Milestone (plan §5) | Depends on |
|---|----------------|---------------------|------------|
| 1 | Design tokens + global dark theme | A | — |
| 2 | Primitives: GlassPanel, pills, buttons, toggles | A | 1 |
| 3 | AppShell + SidebarNav + root layout | A | 1, 2 |
| 4 | Home / Discover — hero + trending rows | A–B | 3 |
| 5 | Movie detail — hero + glass sections | B | 2, 3 |
| 6 | Watchlist + favorites — glass poster grid | B | 2, 3 |
| 7 | Profile, notifications, community, search — shell wrap | B | 3 |
| 8 | Login + Register — centered glass card | B | 1, 2 |
| 9 | Chat route — glass panels in shell | B | 3 |
| 10 | A11y: focus, keyboard, contrast on glass/heroes | C | 4–9 |
| 11 | Responsive: mobile sidebar or bottom nav | C | 3 |
| 12 *(opt)* | Continue watching / mini-player UI stub | D | 4 |
| 13 *(opt)* | `prefers-reduced-transparency` + `prefers-reduced-motion` | D | 2, 3 |

---

## Issue 1 — Design tokens + global dark theme

**Title:** `[UI · Glass v2] Design tokens and global dark base`

**Body:**

## Summary

Establish Tailwind/CSS variables for the glass streaming look per [CinéConnectPlan.md §1](./CinéConnectPlan.md): near-black base, glass surfaces, red accent, typography hierarchy.

## Acceptance criteria

- [ ] Document tokens (in `tailwind` config, CSS variables, or `@theme` — match repo convention).
- [ ] App root / `body` uses dark base (`zinc-950` or equivalent).
- [ ] Red accent scale chosen and documented (primary CTA + active nav only).
- [ ] No feature pages required in this PR — foundation only.

## References

- `docs/issues/CinéConnectPlan.md` §1

---

## Issue 2 — UI primitives

**Title:** `[UI · Glass v2] Primitives: GlassPanel, PillTag, PrimaryButton, PosterCard, ProgressBar, ToggleRow`

**Body:**

## Summary

Build reusable building blocks from [CinéConnectPlan.md §3](./CinéConnectPlan.md) before migrating full pages.

## Acceptance criteria

- [ ] `GlassPanel` — blur, border, radius, padding, optional `className`.
- [ ] `PillTag` — metadata chips.
- [ ] `PrimaryButton` — red CTA + icon slot.
- [ ] `PosterCard` — movie tile for rows/grids.
- [ ] `ProgressBar` — thin bar (can be static stub for now).
- [ ] `ToggleRow` — row with label + switch (watchlist-style).
- [ ] Storybook optional; at least used once in a dev-only or test page, or proceed to Issue 3.

## References

- `docs/issues/CinéConnectPlan.md` §3

---

## Issue 3 — AppShell + sidebar + root layout

**Title:** `[UI · Glass v2] AppShell, SidebarNav, and root route layout`

**Body:**

## Summary

Implement the layout shell from [CinéConnectPlan.md §2](./CinéConnectPlan.md): fixed left rail (logo, nav icons, settings, avatar), scrollable main; wire into TanStack Router root (`__root.tsx` or authenticated parent).

## Sidebar behavior (required)

- **Collapsed (default):** show **icons only** in a narrow column.
- **Expanded:** on **sidebar hover** (desktop), rail **widens** and each item shows its **full label** beside the icon (smooth transition).
- **Keyboard:** expand on **`focus-within`** the rail (or per-item) so tab users see labels, not hover-only.
- **Mobile:** do not rely on hover — defer to Issue 11 (drawer / bottom nav).

## Acceptance criteria

- [ ] `SidebarNav` / `NavItem` with active state (red).
- [ ] Icon-only collapsed state + hover (and focus-within) expand with labels, per plan §2.
- [ ] Main column does not overlap expanded rail; use flex layout + `min-w-0` on main.
- [ ] Links match existing routes (home, search, favorites, watchlist, profile, chat, notifications, etc.).
- [ ] Main content area ready for full-bleed backdrop later.
- [ ] Unauthenticated routes can stay outside shell or use minimal layout (document choice).

## References

- `docs/issues/CinéConnectPlan.md` §2
- `apps/frontend/src/routes/__root.tsx`

---

## Issue 4 — Home / Discover experience

**Title:** `[UI · Glass v2] Home and Discover — hero, trending, genre column stub`

**Body:**

## Summary

First full page(s) in the new system per [CinéConnectPlan.md §4–5](./CinéConnectPlan.md): hero (featured/trending), rows, optional “browse categories” column. Use existing **`GET /api/v1/movies/trending`** (and search entry if already on `/search`).

## Acceptance criteria

- [ ] Index and/or dedicated discover route uses `AppShell` + primitives.
- [ ] Hero block (`HeroMovieBlock` or equivalent) with scrim for text contrast.
- [ ] At least one horizontal row of `PosterCard` from real API data.
- [ ] Continue watching can be **placeholder** (empty state or stub).

## References

- `docs/issues/CinéConnectPlan.md` §4 (Home / Discover)
- `apps/frontend/src/routes/index.tsx`, `search.tsx`, movies hooks/services

---

## Issue 5 — Movie detail page

**Title:** `[UI · Glass v2] Movie detail — glass hero and content panels`

**Body:**

## Summary

Apply glass layout to movie detail per plan §4: backdrop hero, metadata pills, watchlist/favorite actions in glass panels, synopsis area.

## Acceptance criteria

- [ ] Uses `AppShell`.
- [ ] Readable text over poster (gradient scrim).
- [ ] Existing API data wired; no backend change required unless missing fields.
- [ ] Matches red accent for primary actions.

## References

- `docs/issues/CinéConnectPlan.md` §4
- `apps/frontend/src/routes/movie.$movieId.tsx`, `MovieDetailPage.tsx`

---

## Issue 6 — Watchlist and favorites

**Title:** `[UI · Glass v2] Watchlist and favorites — glass grid`

**Body:**

## Summary

Migrate list pages to `GlassPanel` + `PosterCard` grid inside `AppShell` per plan §4.

## Acceptance criteria

- [ ] `watchlist.tsx` and `favorites.tsx` (or equivalent) use new shell and card grid.
- [ ] Loading / empty states styled consistently with v2.

## References

- `docs/issues/CinéConnectPlan.md` §4
- `apps/frontend/src/routes/watchlist.tsx`, `favorites.tsx`

---

## Issue 7 — Remaining main routes (profile, notifications, community, users, search)

**Title:** `[UI · Glass v2] Migrate profile, notifications, community, users, search into AppShell`

**Body:**

## Summary

Wrap secondary routes in `AppShell` and replace ad-hoc backgrounds with glass-consistent panels where appropriate. No new backend scope.

## Acceptance criteria

- [ ] `profile.$userId`, `ProfilePage`, `profile.tsx`, `notifications.tsx`, `CommuityPage`, `users.tsx`, `search.tsx` use shell (split into sub-PRs if large).
- [ ] Document any route intentionally excluded (e.g. bare `LoginPage` until Issue 8).

## References

- `docs/issues/CinéConnectPlan.md` §4
- `apps/frontend/src/routes/`

---

## Issue 8 — Login and Register

**Title:** `[UI · Glass v2] Auth screens — centered glass card`

**Body:**

## Summary

Restyle login/register per plan §4: dark backdrop, centered glass card, red primary button. Keep existing auth logic.

## Acceptance criteria

- [ ] `LoginPage` + `RegisterPage` match v2 aesthetic.
- [ ] Form errors visible on glass (contrast).
- [ ] No change to token storage in this issue (OAuth is out of scope per plan §7).

## References

- `docs/issues/CinéConnectPlan.md` §4
- `apps/frontend/src/routes/LoginPage.tsx`, `RegisterPage.tsx`

---

## Issue 9 — Chat

**Title:** `[UI · Glass v2] Chat route — glass message panels`

**Body:**

## Summary

Apply glass panels to chat UI inside `AppShell`; optional narrower column layout per plan §4.

## Acceptance criteria

- [ ] `chat.tsx` uses `AppShell`.
- [ ] Message list / input areas use `GlassPanel` or consistent borders.
- [ ] No Socket.io protocol changes required for this UI task.

## References

- `docs/issues/CinéConnectPlan.md` §4
- `apps/frontend/src/routes/chat.tsx`

---

## Issue 10 — A11y and contrast

**Title:** `[UI · Glass v2] Accessibility — focus, keyboard, contrast`

**Body:**

## Summary

Close gaps from [CinéConnectPlan.md §8](./CinéConnectPlan.md): keyboard navigation for sidebar, visible focus rings, contrast on heroes and glass.

## Acceptance criteria

- [ ] Tab order logical; sidebar items focusable and activatable.
- [ ] Focus visible on buttons and links (not removed by `outline-none` without replacement).
- [ ] Spot-check hero + glass text against WCAG for main flows (document known exceptions).

## References

- `docs/issues/CinéConnectPlan.md` §8

---

## Issue 11 — Responsive layout

**Title:** `[UI · Glass v2] Mobile — collapsible sidebar or bottom navigation`

**Body:**

## Summary

Per plan §5 Milestone C: mobile-friendly nav; do not clone desktop sidebar 1:1 if it harms UX.

## Acceptance criteria

- [ ] Breakpoint chosen (e.g. `md`) below which sidebar collapses to drawer/hamburger or bottom nav.
- [ ] Main content usable on small screens; no horizontal overflow from glass panels.
- [ ] Document behavior in README or plan appendix.

## References

- `docs/issues/CinéConnectPlan.md` §5 (Milestone C.8)

---

## Issue 12 — (Optional) Continue watching / mini-player stub

**Title:** `[UI · Glass v2] Continue watching row + mini-player tile (UI stub)`

**Body:**

## Summary

Optional Milestone D: UI-only “continue watching” with `ProgressBar` and/or mini-player tile; wire to real API when available.

## Acceptance criteria

- [ ] Placeholder or mocked data acceptable.
- [ ] Uses shared primitives from Issue 2.
- [ ] Clearly marked as stub in code comment if not backed by API.

## References

- `docs/issues/CinéConnectPlan.md` §5 (Milestone D.9)

---

## Issue 13 — (Optional) Reduced transparency and motion

**Title:** `[UI · Glass v2] prefers-reduced-transparency and prefers-reduced-motion`

**Body:**

## Summary

Per plan §1 and §5 Milestone D: respect user OS settings — less blur / solid panels; respect reduced motion for transitions.

## Acceptance criteria

- [ ] `@media (prefers-reduced-transparency)` (or Tailwind `motion-reduce` / arbitrary variants) reduces or removes `backdrop-blur`.
- [ ] Animations respect `prefers-reduced-motion`.
- [ ] Document in CinéConnectPlan or frontend README.

## References

- `docs/issues/CinéConnectPlan.md` §1, §5 (Milestone D.10)

---

## Closing the epic

When **Issues 1–11** are done, check [CinéConnectPlan.md §8 Definition of done](./CinéConnectPlan.md).  
**Issues 12–13** are optional polish (continue-watching stub + reduced transparency/motion).

---
*This document is a breakdown of the Glass streaming UI redesign into GitHub issues. It is meant to guide development and track progress on the frontend implementation of the new design system.*
