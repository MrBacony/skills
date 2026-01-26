---
name: git-fundamentals
description: Safe, structured handling of Git commands and workflows. Use when asked to run or explain git operations (status/add/commit/push/pull/branch/merge/rebase), resolve conflicts, undo mistakes, recover lost commits, or troubleshoot repository state.
---

# Git Fundamentals

## Overview

Provide reliable, low-risk Git command guidance and execution steps for common and advanced workflows, with strict safety guardrails and recovery paths.

## Safety Rules (Always Follow)

1. Confirm the repo path and current branch before making changes.
2. Run `git status` before and after any modifying operation.
3. Prefer non-destructive commands (e.g., `revert` over `reset --hard`) unless explicitly requested.
4. Create a backup branch before risky actions (rebase, reset, force-push).
5. Never force-push without explicit confirmation and a clean understanding of scope.
6. When unsure, stop and ask for clarification rather than guessing intent.
7. If working tree is dirty, either stash or commit before history-rewriting operations.

## Workflow Decision Guide

1. **Uncommitted changes?**
	- Yes → decide: commit vs stash vs discard.
	- No → continue.
2. **Need to synchronize with remote?**
	- Use `fetch` then choose `pull --rebase` or merge, per project preference.
3. **Need to change history?**
	- If yes, ensure backup branch and confirm scope.
4. **Conflict encountered?**
	- Enter conflict resolution flow.
5. **Accidental loss?**
	- Use recovery flow (reflog, fsck).

## Task Playbook

### Check repo state
Use `git status -sb` and `git branch -vv` to confirm state and tracking.

### Stage and commit
Prefer granular staging (`git add -p`) and clear commit messages. Avoid committing unrelated files.

### Branching
Create descriptive branches from the correct base; verify upstream tracking.

### Sync with remote
Use `git fetch` first; prefer `pull --rebase` if linear history is required.

### Merge or rebase
Default to merge unless explicitly requested or project policy prefers rebase. Always create a backup branch before rebase.

### Conflict resolution
Use `git status` to list conflicts, resolve files manually, then `git add` and continue (`rebase --continue` or `commit`).

### Undo / recover
Choose the least destructive option: `restore`, `revert`, `reset --soft`, `reset --hard`, then `reflog` if needed.

### Troubleshooting
Use `git remote -v`, `git log --oneline --decorate --graph`, and `git fsck` when diagnosing issues.

## Reference Guide
Use `references/git-commands.md` for command patterns, safety checklists, and recovery steps.

## Resources

This skill includes example resource directories that demonstrate how to organize different types of bundled resources:

### references/
Documentation and reference material intended to be loaded into context to inform Claude's process and thinking.

**Examples from other skills:**
- Product management: `communication.md`, `context_building.md` - detailed workflow guides
- BigQuery: API reference documentation and query examples
- Finance: Schema documentation, company policies

**Appropriate for:** In-depth documentation, API references, database schemas, comprehensive guides, or any detailed information that Claude should reference while working.

---

**Only the references directory is used for this skill.**
