---
name: github-issues-reader
description: Read, search, and summarize GitHub issues using the GitHub CLI. Use when asked to list, view, filter, or analyze issues in a repo, or to pull issue details/comments; install and authenticate gh if missing (via npm).
---

# GitHub Issues Reader

## Workflow

1. Identify the target repository.
   - If already in a git repo, derive the repo from the current directory.
   - Otherwise, ask for `OWNER/REPO`.

2. Ensure GitHub CLI is available.
   - Check `gh` availability.
   - If missing, install with npm, then re-check:
     - `npm install -g gh`
   - If npm is unavailable, ask the user for an alternate install method.

3. Ensure authentication.
   - Run `gh auth status`.
   - If not authenticated, run `gh auth login` and follow the prompts.

4. List issues.
   - Use `gh issue list` with filters as needed:
     - `--state open|closed|all`
     - `--label "bug"` (repeatable)
     - `--search "text"`
     - `--author USER`
     - `--assignee USER`
     - `--limit N`
   - Use `--json` for structured output (examples: `number`, `title`, `state`, `labels`, `author`, `createdAt`, `updatedAt`).

5. View a specific issue.
   - Use `gh issue view <NUMBER>`.
   - Add `--comments` to include thread context.
   - Use `--json` to extract fields (examples: `body`, `comments`, `labels`, `assignees`).

6. Summarize results for the user.
   - Include: issue number, title, state, labels, assignees, last update, and a short synopsis.
   - For comment-heavy issues, summarize the most recent 3–5 comments and highlight decisions or action items.

## Output expectations

- Prefer concise, actionable summaries.
- If filters are unclear, ask a single clarifying question before listing issues.
- When presenting lists, group by state or label if it improves readability.