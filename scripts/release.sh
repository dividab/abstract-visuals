#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm exec changeset version
pnpm install

pnpm run verify

git add -A
git diff --cached --quiet || git commit -m "Version packages"

# pnpm@12.3.1 (this repo's pin) fails npm registry auth for whoami/publish (upstream bug,
# confirmed not fixable via config); pnpm@10.34.5 works. Run the actual publish through it.
npm_config_manage_package_manager_versions=false mise x pnpm@10.34.5 -- ./node_modules/.bin/changeset publish "$@"

git push --follow-tags
