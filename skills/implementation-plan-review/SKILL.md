---
name: implementation-plan-review
description: "Review and critique implementation plans for Nx/Angular/AnalogJS work, focusing on YAGNI, maintainability, TypeScript safety, security, performance, testing, and documentation. Use when asked to review an implementation plan document, create structured review feedback, or assess whether a plan is too complex or insufficiently tested."
---

# Implementation Plan Review

## Purpose

Produce a pragmatic, YAGNI-focused review of implementation plans in this Nx workspace. Emphasize maintainability, security, test coverage, and avoidance of unnecessary abstraction.

## Inputs

- An implementation plan document (typically in `docs/`)
- Optional PR/issue title and number

## Workflow

1. Identify the implementation plan document and read it fully.
2. Use structured thinking to confirm the problem statement, scope, and success criteria.
3. Scan the codebase for the areas the plan touches (use semantic search when unsure).
4. Read any referenced files or APIs to validate feasibility and consistency.
5. Evaluate the plan against the review criteria below.
6. Write a review file with actionable feedback and concrete suggestions.

## Review Criteria

- **YAGNI & Simplicity (Primary):** Prefer the simplest solution that solves today’s requirement. Flag future-proofing, extra abstractions, or speculative features.
- **Code Quality & Maintainability:** Single-responsibility functions, readable names, minimal duplication, clear error handling.
- **Angular/AnalogJS Practices:** Favor modern patterns (signals, standalone), correct lifecycle usage, SSR/SSG awareness.
- **TypeScript Standards:** Strong types, no `any`, explicit contracts.
- **Security & Performance:** Validate inputs, avoid unnecessary deps/bundle bloat, safe auth/authorization patterns.
- **Testing:** Coverage for critical paths; tests focus on behavior.
- **Documentation:** Only where needed; keep public API changes documented.

## Output File

Create a new markdown file with the following structure and fill in all applicable sections:

```
# Implementation Plan Review - #[PR-number]: [Title]

## 🎯 Summary
**Assessment**: [Approve/Request Changes/Comment]
**Focus Areas**: [Key concerns or highlights]

## 🚨 Critical Issues (Must Fix)
- [ ] **[SECURITY/BUG/ARCHITECTURE]** Issue description
  - **Location**: `file.ts:line`
  - **Problem**: Clear explanation
  - **Solution**: Specific fix needed

## ⚠️ YAGNI Concerns
- [ ] **Over-engineering**: Features or abstractions not needed for current requirements
  - **Current**: [Complex implementation]
  - **Needed**: [Simpler alternative]
  - **Reasoning**: [Why simpler is better]

## 💡 Improvements Needed
- [ ] **[QUALITY/TESTING/PERFORMANCE]** Issue description with specific suggestion

## ✅ Strengths
- What was done well
- Good patterns used

## 🧪 Testing
- **Coverage**: [Assessment]
- **Missing**: [Test scenarios needed]

## 📝 Next Steps
1. Address critical issues
2. Simplify over-engineered parts
3. Add missing tests
4. Update documentation if needed
```

## Code Suggestion Format

Provide concrete before/after guidance when helpful:

```
**File**: `src/feature.ts:45-52`

**Current:**
```typescript
// Complex implementation
```

**Suggested:**
```typescript
// Simpler solution
```

**Why**: [Clear explanation of benefit]
```

## Notes

- Be constructive, specific, and practical.
- Base feedback on actual plan and code context.
- Avoid scope creep in the review.
