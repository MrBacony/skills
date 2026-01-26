# Git Command Guide

## Table of contents
1. Safety checklist
2. Common workflows
3. Sync patterns
4. Merge vs rebase
5. Conflict resolution
6. Undo and recovery
7. Advanced troubleshooting
8. Submodules

## 1. Safety checklist
- Confirm repo root: `git rev-parse --show-toplevel`
- Check status: `git status -sb`
- Confirm branch and tracking: `git branch -vv`
- Fetch before merging or rebasing: `git fetch --all --prune`
- Create backup branch before history edits:
  - `git branch backup/<branch>-<yyyymmdd>`

## 2. Common workflows
### Stage and commit
- `git add -p`
- `git commit -m "<type>: <summary>"`

### New branch from main
- `git switch main`
- `git pull --rebase`
- `git switch -c feature/<name>`

## 3. Sync patterns
### Pull with rebase (linear history)
- `git fetch`
- `git rebase origin/<branch>`

### Merge remote updates
- `git fetch`
- `git merge origin/<branch>`

## 4. Merge vs rebase
- Use merge when preserving branch history is desired or policy mandates.
- Use rebase for clean linear history **only after confirming no shared public branch**.

## 5. Conflict resolution
1. Identify conflicts: `git status`
2. Resolve in files (look for conflict markers).
3. Stage resolved files: `git add <file>`
4. Continue:
   - Rebase: `git rebase --continue`
   - Merge: `git commit`

## 6. Undo and recovery
### Discard local changes in a file
- `git restore <file>`

### Undo last commit but keep changes
- `git reset --soft HEAD~1`

### Undo last commit and discard changes (destructive)
- `git reset --hard HEAD~1`

### Revert a commit (safe for shared branches)
- `git revert <sha>`

### Recover lost commits
- `git reflog`
- `git switch -c recovery/<name> <sha>`

## 7. Advanced troubleshooting
- Find dangling objects: `git fsck --lost-found`
- Inspect history: `git log --oneline --decorate --graph --all`
- Remote issues: `git remote -v`

## 8. Submodules
- Initialize/update: `git submodule update --init --recursive`
- Sync URLs: `git submodule sync --recursive`
