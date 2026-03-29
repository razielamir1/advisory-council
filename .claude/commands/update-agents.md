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
git add .claude/ && git status
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

Show the diff of incoming agent changes before applying:
```bash
git diff HEAD...agents/main -- .claude/agents/ .claude/commands/
```

Show the user: current version → new version, the changelog entries between them, and a summary of what files will change. Ask the user to confirm before continuing.

4. **Pull the update:**
```bash
git subtree pull --prefix=.claude agents main --squash -m "Update agents to vX.X.X"
```

5. **If the subtree pull fails with "prefix already exists" or merge conflict:**

   Present this plan to the user and wait for them to type **PROCEED** before continuing:

   "The update cannot be applied automatically. I need to remove and re-add the agent files. This will delete `.claude/agents/`, `.claude/commands/`, `.claude/settings.json`, and `.claude/VERSION`, then restore them from the latest version. Agent memory files will NOT be touched. Type PROCEED to continue."

   After PROCEED is received:
```bash
git rm -r --cached .claude/agents .claude/commands .claude/settings.json .claude/VERSION 2>/dev/null; rm -rf .claude/agents .claude/commands .claude/settings.json .claude/VERSION
git commit -m "Remove agent files for clean update"
git subtree add --prefix=.claude agents main --squash
git add .claude/
```

6. **Confirm success:**
Read `.claude/VERSION` and tell the user: "Agents updated to vX.X.X" with a summary of what changed.
