# Claude History Explorer

A browsable archive of Claude Code session history, capturing AI-assisted development workflows across multiple projects.

## Contents Overview

### Session Logs (`-claude/`, project folders)
JSONL files containing complete conversation histories between user and Claude:
- **User messages**: Prompts, questions, and task requests
- **Assistant responses**: Code suggestions, explanations, tool calls
- **Tool usage**: File reads, edits, bash commands, searches
- **Summaries**: Auto-generated session summaries
- **Metadata**: Timestamps, git branches, working directories

### Debug Logs (`debug/`)
826 debug output files capturing internal Claude Code operations:
- Settings file watching
- Plugin loading and initialization
- LSP server management
- Skill loading from managed/user/project directories
- Token summarization events
- Hook registration

### File History (`file-history/`)
625 versioned file snapshots organized by session:
- Tracked file backups before modifications
- Version history with `@v1`, `@v2` suffixes
- Enables reviewing file states at any point in session

### Shell Snapshots (`shell-snapshots/`)
154 captures of shell command execution:
- Command inputs and outputs
- Working directory states
- Environment context

### Todos (`todos/`)
Task tracking state from sessions:
- In-progress task lists
- Completed items
- Agent-specific todo states

### Projects (`projects/`)
56 project-specific configuration and state directories including:
- AnalyticsBot
- Inventory management
- ISPublicSites (multiple sub-projects)
- IntegrityStudioClients
- PersonalSite
- Various tooling and documentation projects

### Archive (`archive/`)
Archived session data organized by date:
- Agent configurations
- Historical session snapshots
- Deprecated skill definitions

## Data Format

### JSONL Session Logs
Each line is a JSON object with a `type` field:
- `summary` - Session summary with description
- `user` - User message with content and metadata
- `assistant` - Claude response with tool calls
- `file-history-snapshot` - File state captures
- `system` - System events and commands

### Common Fields
- `uuid` - Unique message identifier
- `parentUuid` - Links to parent message (conversation threading)
- `sessionId` - Groups messages by session
- `timestamp` - ISO 8601 datetime
- `cwd` - Working directory at time of message
- `gitBranch` - Active git branch

## Statistics

- **Session directories**: 4 main + 56 project-specific
- **Debug logs**: 826 files
- **File versions**: 625+ tracked snapshots
- **Shell snapshots**: 154 captures
- **Date range**: November 2025 - January 2026
