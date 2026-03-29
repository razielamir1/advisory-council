# MCP Server Setup Guide

MCP (Model Context Protocol) lets your agents access external systems — databases, GitHub, Slack, and more. All MCP servers are configured in `.claude/settings.json` under the `mcpServers` key.

**Important:** MCP servers are project-wide — all agents can access them. The agent's prompt determines *how* it uses the tools, not *whether* it has access.

---

## How to Add an MCP Server

Edit `.claude/settings.json` and add your server under `mcpServers`:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "command-to-start-server",
      "args": ["arg1", "arg2"],
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

---

## Example: PostgreSQL

Gives `@database-expert` the ability to read schemas and run read-only queries.

**Install:**
```bash
npm install -g @anthropic/mcp-server-postgres
```

**Configure** (`.claude/settings.json`):
```json
{
  "mcpServers": {
    "postgres": {
      "command": "mcp-server-postgres",
      "args": ["postgresql://user:password@localhost:5432/mydb"]
    }
  }
}
```

---

## Example: GitHub

Gives `@code-reviewer` the ability to read PRs, issues, and repository data.

**Install:**
```bash
npm install -g @anthropic/mcp-server-github
```

**Configure** (`.claude/settings.json`):
```json
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github",
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

---

## Example: Filesystem (Read-Only)

Gives agents access to specific directories outside the project.

**Install:**
```bash
npm install -g @anthropic/mcp-server-filesystem
```

**Configure** (`.claude/settings.json`):
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "mcp-server-filesystem",
      "args": ["/path/to/shared/docs", "/path/to/design/assets"]
    }
  }
}
```

---

## Example: Slack

Gives agents the ability to post status updates or read channel messages.

**Install:**
```bash
npm install -g @anthropic/mcp-server-slack
```

**Configure** (`.claude/settings.json`):
```json
{
  "mcpServers": {
    "slack": {
      "command": "mcp-server-slack",
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here"
      }
    }
  }
}
```

---

## Keeping Credentials Out of Version Control

If your MCP server needs a token or password, put the credentials in `.claude/settings.local.json` instead of `.claude/settings.json`. The `settings.local.json` file is machine-specific and should never be committed to Git.

**Step 1 — Add `settings.local.json` to `.gitignore`:**
```
.claude/settings.local.json
```

**Step 2 — Put the MCP server definition (without secrets) in `.claude/settings.json`:**
```json
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github"
    }
  }
}
```

**Step 3 — Put the credentials in `.claude/settings.local.json` on your machine:**
```json
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github",
      "env": {
        "GITHUB_TOKEN": "ghp_your_actual_token_here"
      }
    }
  }
}
```

Claude Code merges both files at startup. Teammates get the server definition from the shared `settings.json` and supply their own tokens in their local `settings.local.json`. No secrets are ever committed.

---

## Security Notes

- **Never commit tokens or passwords** to `.claude/settings.json`. Use `settings.local.json` (see above) or environment variables.
- `settings.local.json` is machine-specific — add it to `.gitignore` and create it fresh on each machine.
- MCP servers run locally on your machine — they are not cloud services.
- Each MCP server provides specific tools (e.g., `query`, `list_tables`). Agents discover these tools automatically.

---

## Verifying MCP Connection

After adding an MCP server, restart Claude Code and type:
```
What MCP tools do you have access to?
```

Claude will list all available MCP tools from all connected servers.
