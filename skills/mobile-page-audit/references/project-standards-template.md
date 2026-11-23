# Mobile standards — <Project name>

> Copy to `.claude/mobile-standards.md` (or `docs/mobile-standards.md`) in the project and reference it from CLAUDE.md / AGENTS.md. The mobile-page-audit skill reads it before every audit and fix, and appends new decisions and traps. Anything here overrides the skill's generic defaults.

## Environment
- Dev URLs: FE `http://localhost:<port>` · API `http://localhost:<port>`
- Chrome DevTools MCP port: `<port>` (how to start it if not running)
- Test accounts: <where they are documented — never paste passwords here if the repo is shared>
- Roles with different layouts: <e.g. staff, customer, admin>
- App scroll container: `<selector>` (fullPage screenshots don't work if it isn't window)
- First-work-item selector for audit.js: `<selector>`
- Type check / lint / build commands: `<...>`
- Commit policy: <commit after each verified page? push?>

## Sizes (decided)
| Thing | Touch | Desktop | Decided |
|---|---|---|---|
| Primary button | | | |
| Secondary control | | | |
| Chips | | | |
| Inputs | 16px | | |
| Body text | | | |
| Radius < 640 | | | |

Pointer/size variant: `<e.g. desk: = (min-width:640px) and (pointer:fine)>` · Breakpoints: `<...>`
Headline target: first item y at 360×740 < `<value>`

## Phone style the app has adopted
<e.g. one-row toolbar [search][filter icon][toggle], export as icon menu, segmented tabs, menu tab = /menu page>
Reference page: `<route>`

## Shared components / hooks (use before creating new)
| Component | Use when |
|---|---|
| | |

## Page patterns
- 

## Traps found in this project
- 

## App-level status (mobile-principles §2)
| ID | Issue | Status / commit |
|---|---|---|
| A1 | Back loses scroll position | |

## Page progress
| Page | Audit IDs | Fixed | Device-tested | Commit |
|---|---|---|---|---|
