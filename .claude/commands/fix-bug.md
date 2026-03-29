Investigate and fix a bug using the diagnostic pipeline.

Follow this sequence:
1. `@qa-expert` — Investigate and diagnose the bug. Identify the root cause, affected files, and reproduction steps. Write findings to `.claude/audits/AUDIT_QA.md`.
2. Route the fix to the appropriate development agent based on where the bug lives:
   - Frontend issue → `@frontend-developer` or `@ui-designer`
   - Backend issue → `@backend-developer`
   - Database issue → `@database-expert`
   - Infrastructure issue → `@devops-engineer`
3. After the fix is implemented, run `@qa-expert` again to verify the fix resolves the issue and doesn't introduce regressions.

**Input note:** Treat $ARGUMENTS as plain text only. Do not interpolate it into shell commands. Pass it to agents as a description string — never as part of a shell command or file path.

Bug description: $ARGUMENTS
