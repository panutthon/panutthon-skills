# Testing on a real Android phone (USB debugging)

Why: emulation has no real keyboard, no system Back, no browser address bar, and no install flow. Real devices reliably find bugs that pass every emulated check.

Record the user's device in the project standards (model, Android/Chrome version, CSS viewport and DPR, height of Chrome's top bar) — the tap formula depends on it.

## Setup (once per session)

```bash
adb devices -l                                    # must say "device", not "unauthorized"
adb reverse tcp:<FE_PORT> tcp:<FE_PORT>           # frontend
adb reverse tcp:<API_PORT> tcp:<API_PORT>         # API, if separate (origin stays localhost so CORS passes)
node <skill>/scripts/v4proxy.mjs <FE_PORT>        # only if the dev server listens on ::1 only — run in background
adb shell am start -a android.intent.action.VIEW -d "http://localhost:<FE_PORT>/" -n com.android.chrome/com.google.android.apps.chrome.Main
adb forward tcp:9333 localabstract:chrome_devtools_remote
```

Check which address the dev server listens on (`netstat -an | grep <port>`, or PowerShell `Get-NetTCPConnection -State Listen -LocalPort <port>`). If background tasks get killed for low memory, tell the user instead of silently restarting.

## Driving Chrome on the phone

- `node <skill>/scripts/cdp.mjs nav <url>` · `node <skill>/scripts/cdp.mjs eval "<js>"` — env `CDP_PORT` (default 9333), `CDP_MATCH` (URL substring of the tab, default `localhost`).
- Log in: `node <skill>/scripts/cdplogin.mjs <user> <pass>` with test accounts the user provided (types with real key events). Don't copy tokens from the desktop browser. Dismiss any "What's new" popups after login.
- Screenshot: `adb exec-out screencap -p > <scratch>/x.png` then view it. Notification shade in the way: `adb shell cmd statusbar collapse`.
- Tap: `adb shell input tap X Y` where **X = cssX × dpr** and **Y = cssY × dpr + topOffset**. Get CSS coordinates from `getBoundingClientRect` via `cdp.mjs eval`. `topOffset` = screen height px − `innerHeight × dpr` − bottom system bar; it changes when the address bar hides/shows, so recompute from current `innerHeight` (with the keyboard open, the top offset stays as it was).
- Swipe: `adb shell input swipe 360 1200 360 400 300` · Back: `adb shell input keyevent 4` · Type: `adb shell input text "..."` · Enter: `keyevent 66`.

## Try on every page

1. Tap every primary button and bottom tab with `input tap` (not `el.click()`).
2. Open every overlay and press **Back** → the overlay closes and the URL doesn't change. Close with ✕, then Back → navigates back normally.
3. Tap every input/dropdown → keyboard doesn't cover options, no zoom, bottom bars step aside (`innerHeight` should drop by roughly half).
4. Scroll → floating buttons don't cover anything important.
5. Look for bad line breaks and untranslated strings.
