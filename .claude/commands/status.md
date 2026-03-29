Give a quick health overview of this project. Scan key areas and report a summary — do NOT fix anything, just report.

## Checks (run all in parallel where possible)

1. **Test Health:**
   - Detect test runner (jest, vitest, pytest, etc.)
   - Run tests and report: total, passed, failed, skipped
   - Report test coverage percentage if available

2. **Security Quick Scan:**
   - Check for `.env` files committed to git (`git log --all -- .env`)
   - Check for known vulnerable dependencies (`npm audit` / `pip audit` / etc.)
   - Check if secrets are in environment variables (not hardcoded)

3. **Code Quality:**
   - Count TODO/FIXME/HACK comments in the codebase
   - Check for lint configuration and run linter if available
   - Count files without any tests (in src/ or equivalent)

4. **Git Health:**
   - Current branch and uncommitted changes
   - How far ahead/behind main
   - Last 5 commits (for context)

5. **Previous Audit Results:**
   - Check if `.claude/audits/` has any reports
   - If yes, summarize the latest findings
   - If no, note that no audits have been run yet

## Output Format

Present results as a clean dashboard:

```
PROJECT HEALTH — [project name]
================================

Tests:       ✅ 45/47 passed (96%) | Coverage: 82%
Security:    ⚠️  2 moderate vulnerabilities in dependencies
Code Quality: 12 TODOs, 3 FIXMEs | Lint: clean
Git:         main, clean working tree, up to date
Last Audit:  2 days ago — 1 critical, 3 medium findings

Recommendation: Run `npm audit` to review vulnerabilities. Apply fixes manually after reviewing the report.
```

Use ✅ for good, ⚠️ for warnings, ❌ for critical issues.
