# Mobile UI/UX principles (beyond "nothing overflows")

Why this file exists: page-by-page audits measure size, overflow and the keyboard, but what makes a web app *feel like a website* is usually app-level behavior — Back loses your place, no way to refresh, a white page when offline. audit.js catches none of that.

Use it when auditing a new page (§1), reviewing the whole app once per round (§2), or when the user asks "is this good mobile practice?".

Sources: Material Design 3 (layout, navigation, empty states), Apple Human Interface Guidelines, web.dev PWA checklist, MDN PWA best practices, WCAG 2.2, Nielsen Norman Group (bottom sheets, mobile UX).

## 1. Per-page checklist

| Principle | Criterion | Source |
|---|---|---|
| Tap targets | ≥ 44pt (iOS) / 48dp (Android); agree a project minimum (40px is a workable floor for secondary controls); ≥ 8px between targets | HIG, MD |
| Press feedback | cards, rows, chips, buttons show a pressed state within 100ms (`:active`/ripple) without shifting layout | HIG, MD |
| Paired buttons | Cancel/Save on phones = equal halves, 44px; one primary action per screen; destructive action red and separate | HIG |
| Forms | visible labels (not placeholder only), errors under the field, correct `type`/`inputMode`/`autoComplete`/`enterKeyHint`, confirm before discarding | MD, HIG |
| Nothing hidden behind floating UI | end-of-page content and the focused field are not covered by tab bar / FAB / keyboard | WCAG 2.2 Focus Not Obscured |
| Color is not the only signal | status (overdue, expired) has text/icon; contrast ≥ 4.5:1 in light and dark | WCAG, HIG |
| Long text | wrap before truncating; codes/emails `overflow-wrap:anywhere` | HIG |
| Empty states | say why (none yet vs. filtered out) + a next action | MD |

## 2. App-level checklist (once per round)

| Principle | Criterion | Source |
|---|---|---|
| Back restores state | Back to a list → same scroll position and filters | HIG, MD |
| Back closes overlays first | sheets/dialogs/menus close before navigating (Android predictive back) | MD |
| Fresh data on return | returning from another app / long idle refetches, or there is pull-to-refresh / a refresh button — standalone PWAs have no reload button | MD |
| Offline | never the browser's error page; the app's own offline page/banner | web.dev PWA (core) |
| Installable | manifest `standalone` + maskable icon + theme-color following the theme + apple-touch-icon | web.dev, MDN |
| Navigation | bottom bar ≤ 5 labeled items; in-app ← on detail pages (iOS has no system Back); deep link to every page | MD, HIG |
| Safe area / viewport | `viewport-fit=cover` + `env(safe-area-*)`; `dvh` not `vh`; never disable zoom | HIG, web.dev |
| Reduced motion | `prefers-reduced-motion` honored in CSS **and** JS animation libraries (e.g. framer-motion `MotionConfig reducedMotion="user"`) | HIG, WCAG |
| Type size | body 14–16px on phones; inputs 16px | MD, HIG |
| Landscape | usable when rotated — top bar + bottom bar + keyboard must not eat the screen (a `short:` variant for height ≤ 500px helps) | MD |
| Undo | reversible deletes offer Undo in a toast | HIG |
| Drafts | long forms survive the app being killed | HIG |
| Bottom sheets | clearly dismissible (✕ + Back + backdrop) — more important than swipe-down; never stack sheets | NN/g |

Keep a status table of these per project (ID, issue, status + commit) in the project standards file.

## 3. How to measure (works in practice)

- **Scroll after Back**: on a real device set the scroll container's `scrollTop = 1500` → tap a list item link in view → `adb shell input keyevent 4` → read `scrollTop` again.
- **Press state**: `adb shell input swipe X Y X Y 1500 &` (long press) and meanwhile read `[...document.querySelectorAll(':active')]` + computed opacity — the innermost `:active` is often an `svg`, not the button.
- **Offline**: ⚠️ DevTools `emulate networkConditions: "Offline"` does not affect service-worker fetches and leaves `navigator.onLine` true. Offline page: `adb reverse --remove tcp:<port>`, wait 3s, open a new URL with `am start` (cutting mid-load gives a fake white page), then restore the reverse. Offline banner: `adb shell cmd connectivity airplane-mode enable|disable` (USB `adb reverse` keeps working).
- **Fresh data on return**: change a record from another machine → switch apps on the phone and back → does the UI update?
- **Landscape**: read `settings get system accelerometer_rotation` first, then `settings put system accelerometer_rotation 0; settings put system user_rotation 1`; restore afterwards.
- **Delete / undo without touching real data**: inject an XHR/fetch mock that answers DELETE/restore with 200, test, then reload.
- **Reduced motion**: `emulate` has no option — use CDP `Emulation.setEmulatedMedia({features:[{name:'prefers-reduced-motion',value:'reduce'}]})` (e.g. via `scripts/cdp.mjs`), then open a modal and confirm no scale animation.
- **Installability**: CDP `Page.getInstallabilityErrors` must be empty.
