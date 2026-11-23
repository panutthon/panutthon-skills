# Design docs config — <Project name>

> Save as `.claude/obsidian-docs.md` in the repo (or `docs-config.md` in the vault root). The obsidian-design-docs skill reads it to know where things are.

- Vault: `<absolute path>`
- Language: `<e.g. Thai, technical terms in English>`
- Reading list lives in: `<repo>/CLAUDE.md` (and/or `AGENTS.md`) under "<heading>"
- Code:
  - Backend: `<path>` — schema `<path>`, modules `<path>`
  - Frontend: `<path>` — routes `<path>`, business-rule constants `<path>`
  - Specs/plans: `<path>`

## File map
| Note | Owns |
|---|---|
| `00-Overview.md` | overview, main modules, **index of all notes** |
| `01-Flow-and-Function.md` | process flows, statuses, permissions, flow-level rules |
| `02-ER-Diagram.md` | table relationships |
| `03-Data-Dictionary.md` | every table/field |
| `04-Tech-Stack.md` | technologies + ADRs |
| `05-Mockup.md` | UI mockups / screen decisions |
| `06-...` | |

New notes take the next number.
