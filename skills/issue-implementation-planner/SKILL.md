---
name: issue-implementation-planner
description: Analyze and validate GitHub issues, then draft minimal YAGNI implementation plans in docs/ for engineering work. Use when asked to review an issue for feasibility/clarity, gather codebase context, create an implementation branch, or produce a step-by-step plan and testing strategy for a specific issue number.
---

# Issue Implementation Planner

## Overview

Validate a GitHub issue for clarity and feasibility, gather codebase context, and produce a minimal, testable implementation plan. Keep scope tight and avoid speculative enhancements.

## Workflow

### 1) Read and validate the issue

- Retrieve the issue content and verify: scope clarity, reproducibility (if bug), acceptance criteria, technical feasibility, architectural fit, dependencies, and hidden requirements.
- If the issue is ambiguous or contradictory, ask a single clarifying question at a time using the question tool. Propose a default when possible.
- If the issue seems invalid, document concerns and recommend escalation instead of planning.

### 2) Gather codebase context

- Use repository search and symbol tools to locate related implementations, patterns, and tests.
- Prefer reading the smallest necessary code units (symbols or focused sections) to avoid unnecessary context.
- If the plan needs library usage details, consult Context7 documentation for up-to-date APIs.

### 3) Create an implementation branch

- Create a feature branch named `issue/[issue_number]-[short-description]`.
- Create the branch with git.

### 4) Write the implementation plan

- Create `docs/[issue_number]_implementation_plan.md`.
- Include: issue summary, validation notes, scope boundaries, technical approach, step-by-step tasks, testing strategy, risks/mitigations, and success criteria checklist.
- Apply YAGNI: plan only what the issue requires and list any future ideas in a separate “Future Considerations” section.

## Plan Template (outline)

- **Issue summary**
- **Validation notes** (clarity, feasibility, dependencies)
- **Scope boundaries** (in/out)
- **Technical approach** (minimal, justified)
- **Implementation steps** (numbered, small increments)
- **Testing strategy** (existing tests + new tests)
- **Risks & mitigations**
- **Success criteria checklist**
- **Future considerations** (optional, explicitly out of scope)

## Quality checks

- Ensure every acceptance criterion is addressed.
- Confirm the plan is implementable with the current architecture.
- Avoid speculative refactors or unrelated improvements.
