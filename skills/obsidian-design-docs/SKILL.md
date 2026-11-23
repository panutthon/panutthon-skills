---
name: obsidian-design-docs
description: >-
  Keep a project's design documentation in an Obsidian vault (numbered Markdown
  notes such as 00-Overview, 01-Flow, 02-ER-Diagram, 07-Backend) in sync with
  the code. Use WHENEVER a feature, flow, business rule, endpoint, permission,
  status, or field was added, changed or removed and the written design docs
  should reflect it — phrasings like "update the docs", "update Obsidian", "sync
  the design docs", "document this feature for the team", "the docs are out of
  date", "create a new note for X", or Thai "อัพเดตเอกสาร", "อัพเดต Obsidian",
  "บันทึกลงเอกสารออกแบบ", "แก้เอกสารให้ตรงโค้ด". Trigger even when "Obsidian"
  isn't said but the user clearly wants the project's design notes current after
  a code change. It verifies facts in the code, edits the right numbered notes
  in place or creates a new one, and registers new notes in the overview index
  and the agent reading list (CLAUDE.md / AGENTS.md). Not for: inline code
  comments/JSDoc, README files, personal journal vaults, writing specs or
  implementation plans, or drafting doc text only in chat.
---

# Obsidian design docs

A design-doc vault is only valuable if it matches the **current** code. Agents and teammates read it before starting work, so a stale note actively misleads. This skill keeps it accurate with small, verified, in-place edits.

## 0. Find the project's vault config

Look, in order, for:
1. A reading list in the project's `CLAUDE.md` / `AGENTS.md` (e.g. "read these design docs before starting") — the listed paths are the vault and its notes.
2. A `docs-config` note in the vault root or `.claude/obsidian-docs.md` in the repo (see `references/vault-config-template.md`).
3. Neither → ask the user for the vault path once, then offer to write the config so later sessions don't ask.

From the config, learn: vault path, note language, the file map (which note owns which topic), where the code lives (backend/frontend paths, schema, constants), and which agent file holds the reading list.

**Always list the vault directory** before assuming the file map — notes get added.

## 1. Verify against the code — never write from memory

Wrong docs are worse than missing docs. Before editing, confirm every fact you will write from the source of truth:

- Backend: modules/controllers/services/DTOs, DB schema (Prisma/migrations/ORM models), tests (to confirm behavior and counts).
- Frontend: route map and guards, feature folders, constants that encode business rules (statuses, priorities, roles, permissions).
- Work done in this session: what was actually implemented, plus any spec/plan files the project keeps.

Grep the real constants, IDs, field names and conditions. Numbers, permissions and field names must match the code exactly.

## 2. Edit an existing note, or create a new one

- **Edit in place** when the topic belongs to an existing note (flow change → the flow note, new endpoint → the backend note, rule change → the feature-reference note). Use targeted edits; don't rewrite whole files (keeps history readable, reduces churn).
  - **Correct outdated statements**, don't just append. If behavior was removed or changed, fix the original sentence; optionally keep a short history line: "previously X → now Y (YYYY-MM-DD)".
- **Create a new note** only for a large, distinct topic that fits nowhere (a new domain, a new detailed reference). Use the next number (`NN-Name.md`), frontmatter, tables and wikilinks.

## 3. Register every new note

A note nobody links to is never found. After creating one:
1. Add it to the overview/index note's link list: `- [[NN-Name]] — short description`.
2. Add its **absolute path** to the reading list in the project's `CLAUDE.md` / `AGENTS.md` (whichever the project uses; update both if both carry the list) so future sessions read it automatically.
3. Wikilink both ways with related notes.

## 4. Keep notes consistent

- Totals and statuses repeated across notes (test counts, epic status, number of roles) must agree — when you change one, grep the vault for the old value.
- A rule described in several notes (flow + feature reference) is fixed in all of them.
- Don't touch notes that are still correct; tell the user which you left alone and why.

## Conventions (follow the vault's existing style first)

Read one or two existing notes and match them. Defaults when the vault has none:

```yaml
---
tags: [project, <project-slug>, <topic>]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

- Bump `updated:` on every edited note (today's date from context).
- Wikilinks `[[NN-Name]]` without `.md`.
- Tables for mappings (status/priority/permission/endpoint) — easy to read and diff.
- State **real values** (status IDs, constants, conditions), not vague prose. Date important changes "(YYYY-MM-DD)".
- Write in the vault's language; keep code identifiers in their original form.

## When done

Report briefly, per file: **created** / **changed what**. Confirm new notes are registered in the index and the reading list. If something *should* be updated but wasn't (e.g. the data dictionary for a new field), propose it as a follow-up rather than skipping silently.
