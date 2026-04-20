#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCS_DIR="$APP_DIR/docs"
HANDOFF_DIR="$DOCS_DIR/handoff"
BACKLOG_DIR="${CODEX_RUNNER_BACKLOG_DIR:-$HANDOFF_DIR/backlog}"
IN_PROGRESS_DIR="${CODEX_RUNNER_IN_PROGRESS_DIR:-$HANDOFF_DIR/in-progress}"
DONE_DIR="${CODEX_RUNNER_DONE_DIR:-$HANDOFF_DIR/done}"
SYSTEM_PROMPT_FILE="${CODEX_RUNNER_PROMPT_FILE:-$DOCS_DIR/CODEX-PROMPT.md}"
LOG_FILE="${CODEX_RUNNER_LOG_FILE:-$SCRIPT_DIR/codex-runner.log}"
LOCK_FILE="${CODEX_RUNNER_LOCK_FILE:-$SCRIPT_DIR/.codex-runner.lock}"
TASK_INTERVAL_MINUTES="${CODEX_RUNNER_INTERVAL_MINUTES:-10}"
TEST_MODE="${CODEX_RUNNER_TEST_MODE:-0}"

mkdir -p "$SCRIPT_DIR" "$BACKLOG_DIR" "$IN_PROGRESS_DIR" "$DONE_DIR"
touch "$LOG_FILE"

timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

log() {
  local message="$1"
  printf '[%s] %s\n' "$(timestamp)" "$message" | tee -a "$LOG_FILE"
}

acquire_lock() {
  if ! (set -o noclobber; printf '%s\n' "$$" > "$LOCK_FILE") 2>/dev/null; then
    local existing_pid
    existing_pid="$(cat "$LOCK_FILE" 2>/dev/null || printf 'unknown')"
    log "Runner already active; lock file exists at $LOCK_FILE (pid: $existing_pid)."
    exit 0
  fi
}

release_lock() {
  rm -f "$LOCK_FILE"
}

update_status() {
  local file_path="$1"
  local status="$2"
  sed -i "/^## Status$/{
n
s/.*/$status/
}" "$file_path"
}

append_note() {
  local file_path="$1"
  local note_text="$2"

  printf '\n%s\n' "$note_text" >> "$file_path"
}

select_next_task() {
  local task
  task="$(find "$BACKLOG_DIR" -maxdepth 1 -type f -name '*.md' | LC_ALL=C sort | head -n 1 || true)"
  printf '%s' "$task"
}

build_codex_prompt() {
  local task_path="$1"
  local task_name
  local system_prompt_contents
  local task_contents
  task_name="$(basename "$task_path")"
  system_prompt_contents="$(cat "$SYSTEM_PROMPT_FILE")"
  task_contents="$(cat "$task_path")"

  cat <<EOF
Use the following system prompt and task brief to do the work.

System prompt from docs/CODEX-PROMPT.md:
$system_prompt_contents

Task file from docs/handoff/in-progress/$task_name:
$task_contents

Requirements:
- Follow the task file exactly and keep scope tight.
- Read any relevant files the task references before changing code.
- Run relevant validation for the task.
- Update the task file status to done.
- Fill the Notes section with what you implemented, decisions made, concerns, and what to test.
- Move the task file to docs/handoff/done/ when complete.
- Commit the changes with a clear message referencing the task name.
- Do not modify docs/SPEC.md or docs/CODEX-PROMPT.md.
EOF
}

run_codex_for_task() {
  local task_path="$1"
  local prompt

  prompt="$(build_codex_prompt "$task_path")"

  if [[ "$TEST_MODE" == "1" ]]; then
    log "TEST_MODE enabled; simulating Codex execution for $(basename "$task_path")."
    return 0
  fi

  log "Invoking Codex for $(basename "$task_path")."
  (
    cd "$APP_DIR"
    npx @openai/codex exec --full-auto "$prompt"
  )
}

mark_failure() {
  local task_path="$1"
  local task_name="$2"
  local error_message="$3"
  local backlog_path="$BACKLOG_DIR/$task_name"

  if [[ -f "$IN_PROGRESS_DIR/$task_name" ]]; then
    task_path="$IN_PROGRESS_DIR/$task_name"
  elif [[ -f "$DONE_DIR/$task_name" ]]; then
    task_path="$DONE_DIR/$task_name"
  fi

  if [[ "$task_path" != "$backlog_path" ]]; then
    mv "$task_path" "$backlog_path"
    task_path="$backlog_path"
  fi

  update_status "$task_path" "backlog"
  append_note "$task_path" "- Auto-runner retry note ($(timestamp)): $error_message"
  log "Returned $task_name to backlog after failure."
}

finalize_success() {
  local task_name="$1"
  local in_progress_path="$IN_PROGRESS_DIR/$task_name"
  local done_path="$DONE_DIR/$task_name"

  if [[ -f "$done_path" ]]; then
    log "Task already moved to done by Codex: $task_name"
    return 0
  fi

  if [[ ! -f "$in_progress_path" ]]; then
    log "Task file missing after successful run: $task_name"
    return 1
  fi

  update_status "$in_progress_path" "done"
  append_note "$in_progress_path" "- Auto-runner note ($(timestamp)): completed by scripted Codex invocation."
  mv "$in_progress_path" "$done_path"
  log "Moved $task_name to done."
}

process_task() {
  local backlog_path="$1"
  local task_name
  local in_progress_path

  task_name="$(basename "$backlog_path")"
  in_progress_path="$IN_PROGRESS_DIR/$task_name"

  log "Starting task $task_name."
  mv "$backlog_path" "$in_progress_path"
  update_status "$in_progress_path" "in-progress"

  if run_codex_for_task "$in_progress_path"; then
    finalize_success "$task_name"
    log "Completed task $task_name."
  else
    local exit_code=$?
    mark_failure "$in_progress_path" "$task_name" "Codex exited with status $exit_code."
    return "$exit_code"
  fi
}

main() {
  acquire_lock
  trap release_lock EXIT

  log "Runner started. Interval target: every $TASK_INTERVAL_MINUTES minutes."

  if [[ ! -f "$SYSTEM_PROMPT_FILE" ]]; then
    log "Missing system prompt file at $SYSTEM_PROMPT_FILE."
    exit 1
  fi

  while true; do
    local next_task
    next_task="$(select_next_task)"

    if [[ -z "$next_task" ]]; then
      log "No backlog tasks found."
      break
    fi

    if ! process_task "$next_task"; then
      log "Stopping run after task failure."
      exit 1
    fi
  done

  log "Runner finished."
}

main "$@"
