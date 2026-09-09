#!/usr/bin/env bash
# Publishes packages to npm, re-prompting for OTP on failure instead of aborting.
# `lerna publish from-package` is safe to rerun: it skips packages already on the registry.
set -euo pipefail

pnpm run verify
pnpm exec lerna version

while true; do
  read -rp "npm OTP (empty to abort): " otp
  if [ -z "$otp" ]; then
    echo "Aborted."
    exit 1
  fi

  if npm_config_manage_package_manager_versions=false mise x pnpm@10.34.5 -- pnpm exec lerna publish from-package --yes --otp="$otp"; then
    exit 0
  fi

  echo "Publish failed. If that was a wrong or expired OTP, enter a fresh one to retry."
done
