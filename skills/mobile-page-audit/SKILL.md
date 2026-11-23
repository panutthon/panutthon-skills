---
name: mobile-page-audit
description: >-
  Audit and fix a web app page by page until it works on phones and tablets like
  a native app — measure with Chrome DevTools MCP at 360/390/820/1366 px (plus
  dark mode and every user role), report findings as a severity table with
  measured numbers, wait for the user to choose what to fix, fix touch-only
  without changing desktop, re-check, and test on a real Android phone over adb.
  Use whenever the user mentions responsive, mobile, phone, iPad, tablet, touch,
  "looks bad on mobile", "make it feel like an app", uneven buttons, audit page
  X on mobile, test on Android / USB debugging, or says "next page" while
  working through pages one by one — even if they never say "responsive". Thai
  triggers: มือถือ, ไอแพด, แท็บเล็ต, ดูไม่สวยบนมือถือ, ทำให้เหมือนแอป,
  ปุ่มไม่เท่ากัน, ตรวจหน้าถัดไป, เสียบสาย debug.
---

# Mobile page audit

Goal: not just "nothing overflows" but **feels like a mobile app** — the page opens on the actual work, controls are finger-sized, panels slide up from the bottom, the Back button closes panels before leaving the page, and desktop stays exactly as it was.

Work **one page at a time, to completion**, through the cycle below.

```
1 Audit → 2 Report (wait) → 3 Fix → 4 Re-audit → 5 Real device (if plugged in) → 6 Docs + commit
```

**Do not edit code during steps 1–2.** The user wants to see the report and decide. "Can you fix this?" is a question, not an instruction; "fix the recommended ones" / "fix all" is.

## 0. Project standards (load first)

Every project accumulates its own sizes, shared components and traps. Keep them in a **project standards file** so later pages follow the same decisions:

1. Look for it in this order: a path named in the project's `CLAUDE.md`/`AGENTS.md`, `.claude/mobile-standards.md`, `docs/mobile-standards.md`, or a project-level copy of this skill's `references/standards.md`.
2. Found → read it before auditing and **before every fix**. It overrides the generic defaults in this skill.
3. Not found → audit with the defaults in `references/patterns.md`. After the first page is fixed, offer to create one from `references/project-standards-template.md` (dev URL, test accounts location, scroll container, breakpoints, shared components, decisions the user made).
4. Whenever the user makes a design decision ("use 44px buttons", "no drag on phones") or a trap costs time, **write it into the project standards file** in the same turn.

## 1. Audit

Prereqs: the app's dev server running, Chrome connected to Chrome DevTools MCP (`list_pages` works). If the MCP cannot reach Chrome, start one with a dedicated profile and `--remote-debugging-port=<free port>` and point the MCP at it.

Always cover this full matrix (a partial first pass always needs a second round):

| Size | `emulate` viewport |
|---|---|
| Small Android | `360x740x2,mobile,touch` |
| iPhone | `390x844x3,mobile,touch` |
| iPad portrait | `820x1180x2,mobile,touch` |
| Desktop (must not change) | `1366x800x1` (no touch) |

- **Every tab / view / chip / filter** of the page, every modal, dropdown, sheet and popover reachable from it, empty states, a middle pagination page.
- **Dark mode** — switch it, check, then **restore the user's theme**.
- **Every user role whose layout differs** (e.g. customer vs staff). Use `new_page` with `isolatedContext` and log in through the form with `fill`, using test accounts the user provided. **Never copy the user's session token** out of their browser.
- Run `scripts/audit.js` (inject via `navigate_page` `initScript`, or paste into `evaluate_script`, then call `window.__audit({ firstItem: '<selector>' })`). It reports horizontal overflow, tap targets < 36px, text < 11px, and where the first work item sits.
- Measure **"y of the first work item" at 360x740** — the headline metric for "does the page open on the work".
- Walk the per-page checklist in `references/mobile-principles.md` §1 (press feedback, paired buttons, forms, color-only signals, empty states) — audit.js measures size, not behavior.
- **Hand-written overlays** (`grep -rln "fixed inset-0" src` or the framework equivalent) do not benefit from fixes to the shared Modal — open every one the page uses.
- When asked "is this good mobile practice overall?" use §2 (app level: Back restores scroll, fresh data on return, offline, reduced motion, landscape) and keep a status table in the project standards.

Mechanics that waste time if unknown — see `references/traps.md` § Auditing (inner scroll containers break full-page screenshots, data loads after navigate, background tabs freeze screenshots, `history.back()` can't test CloseWatcher, destructive clicks may be blocked).

## 2. Report

Write in the user's language. One table per severity: 🔴 major / 🟡 medium / 🟢 minor / ✅ already fine. Give each finding a running ID with a per-page prefix (H1… for Home, W1… for a list page). Every finding states a **measured number** (px, y position, font size, count), not an impression. List issues that affect every page separately. End with a recommendation of what to fix first, then **ask**.

## 3. Fix

Read the project standards (and `references/patterns.md`, `references/mobile-principles.md` for app-level items) before fixing.

- Change **phones/touch only**; desktop must look identical (check 1366 every time). Size changes for touch go behind a touch/pointer condition (e.g. `(pointer: coarse)` or a `desk:` = `(min-width:640px) and (pointer:fine)` variant) so iPads get finger-sized controls; layout changes go behind width breakpoints. See `references/patterns.md` §1.
- Reuse existing shared components (bottom sheet, back-to-close hook, toolbar classes) before creating new ones; when you create one, add it to the project standards.
- Editing an app-wide shared component (Modal, Select, Pagination, FilterPopover…) is fine but **tell the user which other pages it affects**.
- Match the codebase's comment language and style; comments explain *why*.
- Finish with the project's type check, lint on touched files, and production build. Fix pre-existing lint in touched files if the linter blocks.

## 4. Re-audit

The first fix pass always misses something. Check `references/traps.md` § "What the first pass usually misses", then re-run audit on every tab at 360 + iPad + desktop + each role + dark mode.

## 5. Real Android device

If the user plugs in a phone (or asks), follow `references/android-device.md`. Real devices catch what emulation cannot: the keyboard covering dropdowns, Back navigating instead of closing a panel, the browser address bar changing viewport height. Test by real taps, swipes and Back — not only screenshots.

## 6. Close out

- Update the project's design docs / changelog if the project keeps them (ask once if unsure where).
- Update the project standards file with new decisions, components and traps.
- Commit only if the project or user has said to commit after each verified task; otherwise ask. Stage only this task's files (other sessions may be editing the repo), check shared files like locale JSON for unrelated keys, use the project's commit convention. Never push unless asked.

## Bundled files

| File | Use |
|---|---|
| `references/patterns.md` | Default sizes, breakpoint/pointer strategy, reusable mobile UI patterns |
| `references/mobile-principles.md` | Per-page and app-level checklists (HIG, Material 3, web.dev PWA, WCAG 2.2, NN/g) + how to measure them |
| `references/traps.md` | CSS/React/browser/device traps and what first passes miss |
| `references/android-device.md` | adb + CDP setup, tapping, Back, screenshots, offline/rotation tests |
| `references/project-standards-template.md` | Skeleton for a project's own standards file |
| `scripts/audit.js` | In-page measurement (overflow, small taps, tiny text, first item y) |
| `scripts/cdp.mjs` | Navigate / evaluate JS on the phone's Chrome over CDP |
| `scripts/cdplogin.mjs` | Type credentials into a login form with real key events |
| `scripts/v4proxy.mjs` | IPv4 → IPv6 forwarder for dev servers that only listen on `::1` |
