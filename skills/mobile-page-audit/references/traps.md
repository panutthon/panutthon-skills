# Traps that cost time

## Auditing (Chrome DevTools MCP)

- **Inner scroll container**: many app shells scroll a `div`, not `window`, so `fullPage` screenshots show one screen. Set the container's `scrollTop`, or temporarily emulate a very tall viewport (e.g. `390x2600`).
- Data usually arrives ~1–2s after `navigate_page` — wait before measuring.
- Click from `evaluate_script` with `el.click()`; custom selects (react-select etc.) open more reliably by clicking the uid from `take_snapshot`.
- A hidden input and a visible button can share an `aria-label` — qualify the selector (`button[aria-label=...]`).
- Pages opened in the background freeze screenshots → `select_page` + bring to front.
- `history.back()` cannot test "Back closes the panel" when overlays use `CloseWatcher` (no history entry) → press Esc in emulation, or real Back on a device.
- Agent safety modes may refuse clicks on "Delete" buttons, even just to open a confirm dialog → verify the confirm dialog from a non-destructive path (e.g. "discard draft") or mock the network.
- Never lift the user's auth token from their browser into another context; log in through the form in an isolated context.

## CSS / layout

- **Size by pointer, layout by width** — `sm:h-8` gives iPads desktop-size buttons. Use a `(pointer: fine)` variant for sizes.
- iOS zooms into inputs with font-size < 16px — force 16px under `(pointer: coarse)`.
- **`100vh` on Android Chrome = height with the address bar hidden**; when the bar shows, a 100vh box is ~56px taller than the screen and its `sticky bottom-0` children fall below the fold. Emulators have no address bar so they never show it. Use `100dvh` / `h-dvh` for shells.
- **Nested scroll in full-screen modals**: a form that keeps its desktop `max-h-[70vh] overflow-y-auto` inside a full-screen phone modal creates a scroll box in a scroll box — the sticky action bar floats mid-screen with a horizontal scrollbar. Below sm let the form grow (`max-h-none overflow-visible`).
- **Hard-coded radii** (`rounded-lg`) don't follow radius tokens → use the token class everywhere (dropdowns, toasts, dialogs); colored strips on rounded cards need `overflow-hidden`.
- Utility-ordering: custom `@layer utilities` classes (typography helpers) emitted after Tailwind's own can beat `text-[..]` at every breakpoint — don't mix them when you need responsive sizes.
- Tailwind v4 already wraps `hover:` in `@media (hover:hover)` — no need to "fix" hover on touch (verify in built CSS for other setups).
- `transition-colors` plus `transition-[transform,...]` on the same element override each other — use one.
- `offsetLeft` is relative to the nearest *positioned* ancestor — use `getBoundingClientRect` differences inside scroll boxes. Elements hidden at mount (collapsed `hidden` sections) measure 0 → re-run with `ResizeObserver`.
- A page wrapper with fixed `h-full` makes overflowing content ignore the scroll container's bottom padding, so the last items hide behind the tab bar — prefer `min-h-full` on phones.
- Tappable card containing links/buttons: check `e.target.closest('a,button')` before opening the card, or one tap does two things.
- iOS pull-down bounce exposes the scroll container's background — if the top bar and hero are a dark brand color, paint the container's top half that color (fixed to the box, not the content).
- `theme-color` set by a child effect can be overwritten by a parent provider's effect that runs later → set it in `requestAnimationFrame`.
- Some hosts (IIS) have no MIME type for `.webmanifest` → name it `manifest.json`.
- Changes to `index.html` need a full reload; HMR won't pick them up.

## React / behavior

- Hooks that touch `history` or globals must survive StrictMode mount → cleanup → mount.
- Hiding fixed bottom bars on `focus` breaks on Android: Back closes the keyboard but focus stays, so the bar stays hidden. Detect the keyboard from `visualViewport.height` instead.
- `setState` inside `useEffect` to mirror props trips `react-hooks/set-state-in-effect` — compare with the previous value during render.
- A hook needed before an early return: wrap the late-available values in a small child component that calls the hook.
- A page that calls `scrollTo(0)` on mount fights scroll restoration — skip the first run.

## Real device

- Tap coordinates shift when Chrome's address bar shows/hides; compute from `innerHeight` each time (see android-device.md). A mis-tap on Android's system bar can Back out of Chrome.
- `adb reverse` connects to `127.0.0.1`, but Vite (and some dev servers) listen only on `::1` → `ERR_EMPTY_RESPONSE`. Run `scripts/v4proxy.mjs <port>` or start the dev server with `--host 127.0.0.1`.
- CDP `Page.navigate` sometimes does nothing on a phone tab → evaluate `location.assign('<url>')`.
- Pages restored from the back-forward cache keep stale state (a drawer left open) — not a bug; navigate fresh and retest.

## What the first pass usually misses (check before saying done)

- Text **inside rows/cards**, not just chips and headings — read `tinyText` from audit.js.
- Other roles' layouts (customer vs staff).
- **Tablet on every tab** — truncated titles, a lone card on a row, desktop-size buttons.
- Pagination / last button hidden by the FAB or tab bar — **scroll to the very end and measure** last button `bottom` < tab bar `top`.
- Empty state stretched full screen / no way forward.
- English strings leaking from libraries (select "No options", date pickers) in localized apps.
- Keyboard covering things (needs a real device).
- Back button with every new overlay.
- New pages built in the old style when the project has since adopted a newer phone style (one-row toolbar, icon export, segmented tabs) — check the project standards.
- Desktop 1366 still identical.
