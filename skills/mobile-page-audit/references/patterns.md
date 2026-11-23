# Default mobile sizes and patterns

Defaults distilled from shipping a large Tailwind + React admin app to phones as the primary channel. A project standards file overrides anything here. Class names use Tailwind v4 notation; translate for other stacks.

## Contents
1. Size and breakpoint strategy
2. App shell
3. Reusable component patterns
4. Page patterns

## 1. Size and breakpoint strategy

**Width decides layout; pointer decides size.** An iPad is wide but touched with a finger — if control sizes follow `sm:`/`md:` it gets 34px desktop buttons.

Define a desktop-size variant and use it only for control *sizes*:

```css
/* Tailwind v4 */
@custom-variant desk (@media (min-width: 640px) and (pointer: fine));
```

- Size (h, py, px, text) → base = touch size, `desk:` = desktop size.
- Layout (columns, hide/show, widths) → `sm:/md:/lg:`.

| Thing | Touch (phone + tablet) | Desktop (mouse) |
|---|---|---|
| Primary button with text, full-width CTA | 44px (`min-h-11`) | unchanged |
| Secondary controls (filters, export, view toggles, tabs) | 40px (`h-10`) | ~34px |
| Chips | 36px, 12px text | ~26px, 11px text |
| Topbar icon buttons | 40px circles, all identical | unchanged |
| Inputs | **16px font** in `@media (pointer: coarse)` — iOS zooms on focus below 16px | 12–14px |
| Body text | 14px on touch | 13px |
| Secondary text | ≥ 11px | 10–11px |
| Pagination | `h-10 min-w-9` (9 buttons fit 360px) | `h-8 min-w-8` |
| Switch / date clear ✕ | hit area ≥ 52×40 via `::after`; ✕ 40px (on touch the ✕ is the only way to clear a date — no keyboard) | small |
| Corner radius < 640px | cards 16px, controls 12px via radius **tokens** (`--radius-card`), icon buttons `rounded-2xl` | 10px / 6px |

Width breakpoints: `< 640` phone, `768` bottom tab bar disappears / tablet, `1024` sidebar appears, `1280` wide.

Headline target: at 360×740 the **first work item is visible in the first screen** (y < 740; aim ≈ 500).

## 2. App shell

- **Bottom tab bar** (< md): ≤ 5 items with icon + label, one highlighted primary action (e.g. "+ New"), tabs hidden by permission. The scroll container reserves `calc(56px + env(safe-area-inset-bottom))` so pages need not.
- **Top bar** (< md): page title (avoid repeating it as an in-page heading on phones) + search + profile. Language/theme move into the profile or menu page.
- **Detail pages**: top bar becomes `← title ⋯`; hide the bottom tab bar only when the page has its own bottom action bar.
- **Menu tab = a real page** (`/menu`), not the desktop sidebar as a drawer: profile card, grouped rounded lists, settings, confirmed logout. Being a route, the tab shows active state and Back works. Keep nav items + permission checks in **one source** used by both sidebar and menu page.
- **Assistant / chat FAB**: on phones put it in the top bar; floating buttons cover cards and buttons.
- **Fixed bottom elements** hide while the keyboard is open (see traps: focus-based hiding gets stuck on Android).
- `index.html`: `viewport-fit=cover, interactive-widget=resizes-content`, manifest (standalone + maskable icon), `theme-color` synced with the theme.

## 3. Reusable component patterns

| Pattern | Spec |
|---|---|
| Bottom sheet | title + ✕ + backdrop + Esc + safe-area + **Back closes** + drag handle on the header only (not the scrolling body). Footer: paired equal-width 44px buttons; secondary gets a grey fill + darker border (a light border on white makes it look shorter). |
| Back-to-close hook | every overlay: use `CloseWatcher` when available (Chrome/Android 120+, no history entries), else `pushState` fallback; must survive StrictMode double-mount. |
| Filter popover | < 640 becomes a bottom sheet with "Clear (n)" + "Done"; trigger is a 44px icon button with a count badge. |
| Select | Back closes the menu first; on touch with < ~9 options don't open the keyboard; when searching, scroll the field to the top and cap the menu above the keyboard; localize "No options". |
| Date picker | localized calendar; `inputMode="none"` on touch so the keyboard doesn't cover the calendar; visible 40px clear button. |
| Modal | < 640 full-screen by default; small dialogs (confirm, insert link) opt out. Form action row sticks to the bottom as a 50/50 pair, hidden while typing. |
| Segmented control | every tab set / period switch / view toggle on phones: track `bg-edge/70 p-1 rounded-2xl h-11`, selected item = white pill with shadow, `flex-1 basis-0`. Apply with `max-sm:` classes so wider screens keep their style. |
| One-row toolbar | `[search 44px, flex-1][filter icon + badge][view toggle / + icon]`. Export becomes an icon menu at the end of the row, never a full-width row of PDF/Excel buttons. A full-width "Add" button becomes a + icon in the search row. |
| Undo toast | for reversible deletes, a toast with "Undo" (≈8s) instead of making users find a restore screen. |
| Draft autosave | long forms save a draft (per user) to localStorage; restore banner on reopen; cancel pending timers on save/discard or the draft resurrects. |
| Scroll restoration | Back to a list restores scroll position and filters of the app's scroll container. |
| Pull to refresh / refresh on return | in PWA mode there is no reload button: pull-down at top on touch + refetch when returning after ≥ 1 min; `overscroll-y-contain` to stop the browser's own reload. |
| Offline | service worker answers navigations with an offline page (don't cache app bundles unless you mean to); offline banner from `navigator.onLine`; bump the cache version when those files change. |

## 4. Page patterns

- **Wide tables** → below `lg` a card list `grid grid-cols-1 md:grid-cols-2` (`grid-cols-1` is required or cells grow to content width). Titles get `[overflow-wrap:anywhere]`.
- **Tables in printable reports** (window.print) → cards `sm:hidden` + table `max-sm:hidden` using CSS, not JS media queries, so paper (wider than sm) prints the table.
- **Narrow tables** → hide secondary columns, move their data to a second line under the title; hide `<thead>` if one column is left; no lonely "-" for empty values; dates without a header need a label.
- **Overdue badges** say how much ("12 days late"), not just "late".
- **Many columns (Kanban)** → chips + one column at a time + swipe. **No drag on phones**: tap → choose target from a sheet (what Jira/Trello mobile do). If drag is unavoidable on touch: Mouse + Touch sensors with `{delay: 250, tolerance: 8}` (distance-based pointer sensors turn scrolls into drags) and `pointerWithin` collision for full-width items.
- **Summary cards** → short (number + detail on one line), horizontal `snap-x snap-mandatory` or a 3-column grid; on tablet never leave one card alone on a row.
- **Secondary filters** → horizontally scrolling chips, tap again to deselect; scroll the active chip into view.
- **Empty states** → don't stretch full height (`lg:flex-1` not `flex-1`); distinguish "nothing yet" from "nothing matches filters"; offer a next action.
- **Many unequal buttons** → collapse the minor ones into one menu.
- **Full-page forms** → top bar ✕ instead of ←, bottom tab bar hidden, sticky 50/50 action pair hidden while the keyboard is open, confirm before discarding — compare *dirty fields*, not a whole-form `isDirty` (fields missing from defaults make an untouched form dirty). Mostly-locked edit forms show read-only rows (`dl`), not grey disabled inputs.
- **Long secondary info at the top of a detail page** → collapsed behind a toggle on phones; in-page tabs `sticky` on phones.
- **Rich-text editor toolbar** → one horizontally scrolling row with 36px buttons.
- **URL state changed from inside an overlay** (filters) → `replace` history on touch so Back doesn't step through every filter change.
- **Labels and table headers** → sentence/Title case in source, not CSS `uppercase` (hard to read on small screens).
