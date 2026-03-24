# CinéConnect — Glass streaming UI (reference: design v2)

**GitHub issue breakdown:** [GLASS_UI_GITHUB_ISSUES.md](./GLASS_UI_GITHUB_ISSUES.md) (13 suggested issues: 11 core + 2 optional, with dependency order).

Single visual direction: **dark glassmorphism**, **red accent**, **sidebar + dashboard grid**, **rounded cards**, **hero + rows** (no bento / thick white wireframe style).

---

## 1. Design tokens (Tailwind-oriented)

| Token | Role | Suggested direction |
|--------|------|---------------------|
| **Background** | App base | Near-black (`zinc-950` / `#09090b`) or subtle gradient |
| **Glass surface** | Panels, cards | `bg-white/5`–`bg-white/10`, `backdrop-blur-xl`, `border border-white/10`–`/20` |
| **Radius** | Cards, inputs | `rounded-2xl`–`rounded-3xl` for large panels; `rounded-full` for pills |
| **Accent** | Primary actions, active nav, logo | One red scale (e.g. `red-600` hover `red-500`); avoid second strong hue |
| **Text** | Hierarchy | Primary `text-white`, secondary `text-zinc-400`, muted `text-zinc-500` |
| **Hero / imagery** | Backdrops | Full-bleed poster/backdrop with **gradient scrim** (`from-black/80`) so text stays readable |

**Rules**

- Prefer **blur + thin border** over heavy shadows; shadows only subtle if needed.
- **One accent** (red) until the system is stable.
- Respect **`prefers-reduced-transparency`**: optional fallback (solid `bg-zinc-900/95`, less blur).

---

## 2. Layout shell (implement first)

**`AppShell`** (or root route layout)

- **Left sidebar (fixed) — icon rail with hover expand:**
  - **Default:** narrow width; **icons only** (logo, Home, Search, favorites/watchlist, profile, chat, notifications, etc.), spacer, settings, **avatar** at bottom.
  - **Hover (desktop):** rail **animates wider** and each item shows its **full label** next to the icon (smooth width transition, no layout jump in main content — main area uses flex + `min-w-0`).
  - **Accessibility:** also expand on **`focus-within`** (keyboard/tab) so labels are not hover-only; tooltips with `aria-label` on icon-only state are a good fallback.
  - **Mobile:** hover-expand is unreliable; use a **drawer / bottom nav** (see Milestone C) instead of depending on hover.
- **Main:** scrollable; optional **full-bleed background layer** (poster image) behind glass content.
- **Max width:** optional `max-w-*` for readability on ultra-wide; or full width with internal grid padding.

**Deliverable:** All authenticated (and optionally public) routes render inside this shell so you don’t restyle every page from scratch.

---

## 3. Primitive components (build before feature pages)

| Component | Responsibility |
|-----------|----------------|
| **`GlassPanel`** | `children`, optional `className`; applies blur, border, radius, padding |
| **`SidebarNav` / `NavItem`** | Icon + label; **collapsed** = icon only; **expanded** = icon + full name on rail hover/focus-within; **active** = red |
| **`PillTag`** | Metadata chips (e.g. rating, duration, “Top 10”) |
| **`PrimaryButton`** | Red CTA (“Watch now”, “Resume”) with icon slot |
| **`HeroMovieBlock`** | Large backdrop/poster, title area, tags row, primary CTA |
| **`PosterCard`** | Standard movie tile for rows |
| **`ProgressBar`** | Thin bar for “Continue watching” (can be stub until API exists) |
| **`ToggleRow`** | Watchlist / autoplay-style row inside a glass card |

---

## 4. Page mapping (existing routes → new layout)

| Route / area | UI pattern (v2) |
|--------------|-----------------|
| **Home / index** | Hero (featured or trending) + rows (trending, continue watching stub) |
| **Discover** | Same as home emphasis: **trending** (`GET /api/v1/movies/trending`), search entry, genre list column (can mirror mock “Browse categories”) |
| **Movie detail** | Hero + metadata pills + actions (watchlist/favorite) in glass panels |
| **Watchlist / favorites** | Grid of `PosterCard` inside `GlassPanel` |
| **Profile** | Sidebar unchanged; profile as dashboard tiles (stats, lists stub) |
| **Chat** | Optional: narrower main or slide-over; keep glass panels for message list |
| **Login / Register** | Centered glass **card** on dark (or subtle backdrop); red primary button |

**Do not** redesign every screen in one PR: **shell + Discover/home first**, then migrate other routes.

---

## 5. Implementation order (milestones)

### Milestone A — Foundation (1–2 PRs)

1. Add design tokens (CSS variables or Tailwind `@theme` / config extensions if used).
2. Implement `GlassPanel`, `AppShell`, `SidebarNav`.
3. Wire **`__root.tsx`** (or parent route) so main app uses the shell.
4. Migrate **one** page end-to-end (e.g. **Discover** or **index**) using real trending API.

### Milestone B — Core browsing

5. Movie rows, hero block, poster grid on list pages.
6. Movie detail page: hero + glass sections for synopsis / cast area (existing data).

### Milestone C — Polish & a11y

7. Focus states, keyboard nav for sidebar, contrast audit on glass over images.
8. Mobile: collapsible sidebar or bottom nav (simplified — don’t clone desktop 1:1). **Done (issue #314):** below Tailwind `md`, a sticky top bar + **left drawer** (labelled list + account actions); `md+` keeps the hover-expand rail. See `apps/frontend/README.md` → App shell and mobile navigation.

### Milestone D — Optional enhancements

9. Mini-player / “now playing” tile (UI-only or linked to trailers when API exists).
10. `prefers-reduced-transparency` and reduced-motion preferences.

---

## 6. Assets & references

- **Reference image:** glass dashboard over scenic background; red logo; sidebar icons; “Continue watching” with progress; category list + “Explore more”.
- **Saved asset path (if copied in repo):** `assets/...` (adjust to your actual path).

---

## 7. Out of scope for this doc (track separately)

- OAuth (Google/GitHub)
- Feed, lists, cinema, recommendations (backend + schema)
- Full Socket.io presence (unless you add UI placeholders)

Those features should **reuse** `GlassPanel` + shell when built so the product stays visually consistent.

---

## 8. Definition of done (UI track)

- [ ] All primary user flows run inside **AppShell** with **sidebar**.
- [ ] No page uses the old layout as the default (legacy pages either migrated or explicitly excluded).
- [ ] **Red accent** only for primary actions and active nav (document exceptions if any).
- [ ] **Glass** = blur + border; hero text always passes **contrast** over imagery.
- [ ] Lighthouse / manual check: keyboard + visible focus on nav and buttons.

---