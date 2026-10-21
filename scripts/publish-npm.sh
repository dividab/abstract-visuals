#!/usr/bin/env bash
# Publishes packages to npm, re-prompting for OTP on failure instead of aborting.
# `lerna publish from-package` is safe to rerun: it skips packages already on the registry.
# With --web, publishes with `npm publish` instead, which handles 2FA in the browser (passkey/security key),
# since lerna only supports typing an authenticator-app OTP.
set -euo pipefail

web=false
for arg in "$@"; do
  case "$arg" in
    --web) web=true ;;
    *)
      echo "Unknown argument: $arg (usage: pnpm publish-npm [--web])"
      exit 1
      ;;
  esac
done

if ! npm whoami >/dev/null 2>&1; then
  echo "Not logged in to npm — running npm login (press Enter to open the login page in your browser, see README for WSL browser setup)."
  npm login
fi

if [ "$web" = false ] && ! pnpm whoami >/dev/null 2>&1; then
  echo "pnpm can't authenticate to npm: remove the stale //registry.npmjs.org/:_authToken line from ~/.config/pnpm/auth.ini (see README)."
  exit 1
fi

pnpm run verify
pnpm exec lerna version

if [ "$web" = true ]; then
  pack_dir=$(mktemp -d)
  trap 'rm -rf "$pack_dir"' EXIT

  for manifest in packages/*/package.json; do
    dir=$(dirname "$manifest")
    read -r name version private < <(node -p "const p = require('./$manifest'); [p.name, p.version, !!p.private].join(' ')")
    if [ "$private" = true ]; then
      continue
    fi
    if [ -n "$(npm view "$name@$version" version 2>/dev/null || true)" ]; then
      echo "$name@$version is already published, skipping."
      continue
    fi

    # pnpm pack rewrites workspace:^ dependencies to real versions, which npm publish can't do
    tarball=$(pnpm --dir "$dir" pack --pack-destination "$pack_dir" --json | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(0)).filename)")
    echo "Publishing $name@$version — npm will ask you to authenticate in the browser."
    npm publish "$tarball"
  done
  exit 0
fi

while true; do
  read -rp "npm OTP (empty to abort): " otp
  if [ -z "$otp" ]; then
    echo "Aborted."
    exit 1
  fi

  if pnpm exec lerna publish from-package --yes --otp="$otp"; then
    exit 0
  fi

  echo "Publish failed. If that was a wrong or expired OTP, enter a fresh one to retry."
done
