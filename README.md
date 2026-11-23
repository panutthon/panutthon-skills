# Panutthon skills

Reusable skills for Claude Code (and other agents that read `SKILL.md`), extracted from real project work.

| Skill | What it does |
|---|---|
| [`mobile-page-audit`](skills/mobile-page-audit/SKILL.md) | Audit and fix a web app page by page until it feels like a native app on phones and tablets: Chrome DevTools MCP at 360/390/820/1366, severity report with measured numbers, touch-only fixes that leave desktop untouched, re-audit, and real-Android testing over adb. Learns each project's standards in a per-project file. |
| [`obsidian-design-docs`](skills/obsidian-design-docs/SKILL.md) | Keep a project's design docs in an Obsidian vault in sync with the code: verify facts in source, edit numbered notes in place, register new notes in the index and the agent reading list. |

## Install

With the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add panutthon/panutthon-skills
```

Or manually — copy a skill folder into your skills directory:

```bash
# personal (all projects)
cp -r skills/mobile-page-audit ~/.claude/skills/
# or one project
cp -r skills/mobile-page-audit <repo>/.claude/skills/
```

## How `mobile-page-audit` adapts to your project

The skill ships generic defaults (`references/patterns.md`, `traps.md`, `mobile-principles.md`). The first time you use it in a project it offers to create a **project standards file** from `references/project-standards-template.md` — dev URLs, roles, scroll container, sizes you decided, shared components, traps. Every later audit and fix reads that file first, and the skill keeps appending to it, so page 20 is built the same way as page 1.

Requirements: Chrome DevTools MCP; for device tests, `adb` and Node 22+.

## License

MIT
