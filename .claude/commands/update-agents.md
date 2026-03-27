Update the agent system to the latest version. Execute the following steps — do NOT ask the user to run commands manually.

## Steps

1. **Check if the `agents` remote exists:**
```bash
git remote get-url agents 2>/dev/null
```
If it fails, add the remote:
```bash
git remote add agents https://github.com/razielamir1/orca.git
```

2. **Save any uncommitted work:**
```bash
git add -A && git status
```
If there are changes to commit:
```bash
git commit -m "Save current state before agent update"
```

3. **Fetch and show what changed:**
```bash
git fetch agents main
```
Read the remote changelog:
```bash
git show agents/main:.claude/VERSION 2>/dev/null
```
Read the local version from `.claude/VERSION` (first line).

Show the user: current version → new version, and the changelog entries between them.

4. **Pull the update:**
```bash
git subtree pull --prefix=.claude agents main --squash -m "Update agents to vX.X.X"
```

5. **If the subtree pull fails with "prefix already exists" or merge conflict:**
```bash
rm -rf .claude
git add -A && git commit -m "Remove old .claude for clean agent update"
git subtree add --prefix=.claude agents main --squash
```

6. **Confirm success:**
Read `.claude/VERSION` and tell the user: "Agents updated to vX.X.X" with a summary of what changed.
