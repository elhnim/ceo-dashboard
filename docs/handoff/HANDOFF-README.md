# Agent Handoff Protocol

This folder coordinates work between Claude Code (primary) and Codex (co-agent).

## How It Works

1. **Claude Code** creates task files in `backlog/` with structured briefs
2. **Codex** picks up tasks, moves them to `in-progress/`
3. On completion, Codex moves tasks to `done/` with implementation notes
4. **Claude Code** reviews completed work and integrates

## Task File Format

Every task file follows this structure:

```markdown
# Task: [Short Title]

## Status
backlog | in-progress | done

## Priority
P0 (blocking) | P1 (high) | P2 (normal) | P3 (low)

## Objective
What needs to be built or done, in 1-2 sentences.

## Context
Why this task exists and how it fits into the broader system.
Reference the spec: docs/SPEC.md

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Relevant Files
- `path/to/file.ts` — description of relevance

## Constraints
- Must follow existing patterns in [file/folder]
- Must not modify [protected area]
- Use [specific library/approach]

## Notes (filled by Codex on completion)
_Implementation notes, decisions made, anything Claude Code should review._
```

## Naming Convention

Task files: `[priority]-[short-kebab-name].md`
Examples: `p1-supabase-schema.md`, `p2-business-crud-api.md`

## Rules

- **Never modify the spec** — only Claude Code updates `docs/SPEC.md`
- **Never change architecture decisions** — flag concerns in the task notes
- **Follow existing code patterns** — check CLAUDE.md and existing code before writing
- **One task = one concern** — if scope grows, flag it, don't expand silently
- **Test what you build** — include test evidence in completion notes
