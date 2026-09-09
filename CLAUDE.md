# abstract-visuals monorepo

pnpm workspace managed with [lerna](https://lerna.js.org/). Build = TS project references (`tsc -b`). Dev-env setup: README.md (uses [mise](https://mise.jdx.dev) for node/pnpm, see `.tool-versions`).

## Layout

- `packages/{abstract-image,abstract-chart,abstract-document,abstract-3d,abstract-sheet}`: published npm packages, each with its own README/CHANGELOG
- `packages/abstract-visuals-example`: storybook/vite example app, not published
- `packages/{handlebars-xml,jsxpression}`: supporting packages (XML templating, JS expression parsing)
- `packages/tsconfig.json`: TS project references list — keep in sync with `packages/*` when adding/removing a package

## Style

- Functional style is the direction, enforced incrementally via oxlint's `functional` plugin — several of its rules (`no-this-expressions`, `prefer-readonly-type`) are currently off as a migration baseline, not endorsed style (see Gotchas)
- Compact, maintainable logic: avoid duplicated patterns, don't over-split into many small functions

## Commands

- IMPORTANT: Always use the root `pnpm` scripts instead of invoking `oxlint`/`oxfmt`/`tsc` directly (via `npx`, `pnpm exec`, or any other direct call) — even for one-off flags like `--print-config`; the root scripts carry required flags/config
- `pnpm build` = `tsc -b packages`
- `pnpm lint` = oxlint (type-aware, `-c ./oxlint.config.js`); plugins come from `oxlint-config-divid`
- `pnpm fmt` / `pnpm fmt:check` = oxfmt
- `pnpm test` = vitest run (whole repo); `pnpm test:abstract-image` / `pnpm test:abstract-document` for those packages only
- `pnpm verify` = lint + build + test (what CI effectively checks)
- `pnpm cleanbuild` = clean + build

## Workflow

- Before starting a new task, if there are no current uncommitted code changes, run `git pull` first to make sure you're working from the latest master
- When asked to commit and push, chain `git add`, `git commit`, and `git push` in a single Bash invocation (`&&`) so it's one permission prompt total — never separate prompts for add, then commit, then push
- IMPORTANT: Never use `sed` (especially `sed -i`) to change files, even one-line config tweaks — always use the Edit tool instead. This is a hard rule, not a preference: `sed -i` doesn't get generally permitted no matter how often it's asked for, since it bypasses per-file permission rules and shows no reviewable diff
- To view specific line ranges in one or more files, use the Read tool's `offset`/`limit` per file — never a bash `sed`/`awk`/`cd`+`for` loop. Read never needs a permission prompt; a `cd`+`for` wrapper always does
- Read-only inspection commands (`grep`, `find`, `ls`, `head`, `echo`, `xargs`, `sort`, `uniq`, `wc`, `awk`, `git status`/`diff`/`pull`/`log`/`show`/`branch`/`blame`/`fetch`/`remote`/`rev-parse`/`stash push`/`pop`/`show`/`list`, `pnpm build`/`cleanbuild`/`lint`/`fmt`/`fmt:check`/`test`/`test-coverage`/`install`/`update`/`why`/`clean-node-modules`/`run`/`list`/`outdated`/`-r *`/`--filter * run *`) are already generally permitted in `.claude/settings.json` — chaining/piping them together (`|`, `&&`, `$(...)`) doesn't need separate approval as long as the command _starts_ with one of these. `cat > *` (file-write redirection) is also generally permitted. A leading shell construct (variable assignment, `cd`, `for`) breaks this even if only safe commands follow, since it's not prefix-matchable. Don't stop to ask whether these need a new permission rule; only flag genuinely new or destructive command shapes

## Gotchas

- `oxlint.config.js`: several rules off = migration baseline, not endorsed style — check there before assuming a rule is enforced
- No separate `typecheck` script: `pnpm build` (`tsc -b`) both typechecks and emits via project references
- Publishing (`pnpm publish-npm`) needs `~/.npmrc` auth; `scripts/publish-npm.sh` runs the publish step under `pnpm@10.34.5` instead of the repo's pinned `pnpm@12.3.1` due to a registry-auth bug in the pinned version, and re-prompts for OTP on failure instead of aborting — see README
