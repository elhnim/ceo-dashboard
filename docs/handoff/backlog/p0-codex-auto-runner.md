# Task: Build Codex Auto-Runner Script

## Status
backlog

## Priority
P0 (blocking)

## Objective
Create a script that automatically scans `docs/handoff/backlog/` every 10 minutes for new task files. When tasks are found, Codex should pick them up and implement them — one at a time, in priority order (p0 first, then p1, p2, p3).

## Context
This project uses a two-agent workflow:
- **Claude Code** (Tech Lead) creates detailed task files in `docs/handoff/backlog/`
- **Codex** (Developer) picks up those tasks and implements them

Currently, someone has to manually trigger Codex for each task. This script automates that so Codex works autonomously — scanning for new tasks and implementing them without human intervention.

## What to Build

A self-running automation script that:

1. **Scans** `docs/handoff/backlog/` for `.md` task files every 10 minutes
2. **Picks up** the highest priority task (sorted by filename: `p0-*` before `p1-*` etc.)
3. **Reads** the task file content to understand what to implement
4. **Reads** the system prompt from `docs/CODEX-PROMPT.md` for coding conventions
5. **Implements** the task fully (code, tests, etc.)
6. **Moves** the task file from `backlog/` to `done/` when complete, with implementation notes
7. **Commits** changes with a clear message referencing the task name
8. **Repeats** — checks for the next task in the backlog
9. **Handles errors** — if implementation fails, moves the task back to `backlog/` with error notes so it can be retried
10. **Prevents overlapping runs** — uses a lock file so two instances don't run simultaneously

## Technical Requirements

- Use `codex exec --full-auto` for non-interactive execution
- Working directory should be the `app/` folder (the Next.js project root)
- Log all activity to `scripts/codex-runner.log` with timestamps
- Use a lock file at `scripts/.codex-runner.lock` to prevent concurrent runs
- Should work on Windows (Git Bash) since the developer uses Windows 11
- Add the script to `scripts/` directory
- Include a setup script or instructions for scheduling via Windows Task Scheduler (every 10 minutes)

## File Structure

```
scripts/
├── codex-runner.sh          # Main runner script
├── codex-runner.log         # Auto-generated log file
├── .codex-runner.lock       # Auto-generated lock file (gitignored)
└── setup-scheduler.ps1      # PowerShell script to register Windows Task Scheduler job
```

## Acceptance Criteria
- [ ] `scripts/codex-runner.sh` scans backlog and processes tasks in priority order
- [ ] Tasks move from `backlog/` → `done/` on success
- [ ] Tasks move back to `backlog/` on failure with error notes appended
- [ ] Lock file prevents concurrent runs
- [ ] All activity logged with timestamps to `scripts/codex-runner.log`
- [ ] `scripts/setup-scheduler.ps1` registers a Windows Task Scheduler job to run every 10 minutes
- [ ] `.gitignore` updated to exclude `.codex-runner.lock` and `codex-runner.log`
- [ ] Script tested: place a dummy task in backlog, run the script, verify it gets processed

## Relevant Files
- `docs/CODEX-PROMPT.md` — System prompt with coding conventions (Codex reads this for each task)
- `docs/handoff/HANDOFF-README.md` — Task file format and naming conventions
- `docs/handoff/backlog/` — Where tasks live
- `docs/handoff/done/` — Where completed tasks go
- `app/.gitignore` — Add lock/log exclusions

## Constraints
- Must work on Windows 11 with Git Bash
- Must use `npx @openai/codex exec --full-auto` for triggering
- Do NOT modify any existing task files in the backlog (except the dummy test task)
- Do NOT modify `docs/SPEC.md` or `docs/CODEX-PROMPT.md`
- The script should be idempotent — running it when the backlog is empty should do nothing

## Notes (filled by Codex on completion)
_Implementation notes, decisions made, anything to review._
