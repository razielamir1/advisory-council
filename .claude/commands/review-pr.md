Review a pull request. Run code review and security analysis on the PR changes.

## Input
$ARGUMENTS should be a PR number (e.g., `/review-pr 42`) or a branch name (e.g., `/review-pr feature/login`).

**Input validation:** If $ARGUMENTS is a PR number, verify it is numeric only (no shell metacharacters). If it is a branch name, ensure it contains only alphanumeric characters, hyphens, underscores, and forward slashes. Reject inputs that contain spaces, semicolons, backticks, `$`, `|`, `&`, `>`, `<`, or other shell metacharacters.

## Pipeline

1. **Get PR changes:**
   - If a number: run `gh pr diff $ARGUMENTS` to get the diff
   - If a branch: run `git diff main...$ARGUMENTS` to get the diff
   - Also run `gh pr view $ARGUMENTS` (if number) to get the PR description

2. **Launch in parallel:**

   **@code-reviewer** — Review the diff for:
   - Code quality, readability, maintainability
   - Potential bugs or logic errors
   - Missing error handling
   - Naming conventions and consistency
   - Unnecessary complexity

   **@security-analyst** — Review the diff for:
   - Security vulnerabilities (OWASP Top 10)
   - Hardcoded secrets or credentials
   - SQL injection, XSS, CSRF risks
   - Authentication/authorization issues

3. **Summary:** Present a unified review with:
   - Approval recommendation (approve / request changes / needs discussion)
   - Critical issues (must fix before merge)
   - Suggestions (nice to have, not blocking)
   - Security findings (if any)

Keep the review concise and actionable. Focus on the changes, not the entire codebase.
