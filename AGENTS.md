# Shared agent instructions

Read and follow [CLAUDE.md](CLAUDE.md) before working in this repository. It is
the source of truth for project conventions, commands, and workflow; keep those
instructions there rather than duplicating them here.

Reuse [.claude/settings.json](.claude/settings.json) as the source of repository
permission preferences. Reading that file solely to load these preferences is
allowed; otherwise respect its denied paths and operations. Treat allowed
commands as intended routine operations, subject to Codex's active sandbox and
approval rules. Claude's permission syntax does not itself grant Codex tool
permissions or override those rules.

Respect [.claudeignore](.claudeignore) when searching and reading repository
content, including its exceptions. These are agent instructions, not an
enforced filesystem boundary.

Translate Claude-specific tool references to available equivalents: use
`apply_patch` for edits and available file-reading tools or narrowly scoped
read-only shell commands for inspection. Preserve the prohibition on editing
files with `sed`.
