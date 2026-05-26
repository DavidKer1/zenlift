#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
FLOW_FILE="$ROOT_DIR/e2e/maestro/ios-core-loop.yaml"
ARTIFACT_DIR="${MAESTRO_ARTIFACT_DIR:-$ROOT_DIR/e2e/artifacts/maestro}"
APP_ID="${MAESTRO_APP_ID:-com.zenlift.workout}"
LOG_FILE="$ARTIFACT_DIR/ios-core-loop.log"

log_info() {
  printf '[agent-ios] %s\n' "$*" >&2
}

fail() {
  printf '[agent-ios] ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  local -r command_name="$1"
  local -r install_hint="$2"

  command -v "$command_name" >/dev/null 2>&1 || fail "$command_name is required. $install_hint"
}

[[ -f "$FLOW_FILE" ]] || fail "Maestro flow not found at $FLOW_FILE"
require_command "maestro" "Install Maestro from https://docs.maestro.dev/getting-started/installing-maestro"
require_command "xcrun" "Install Xcode Command Line Tools and open Xcode once to finish setup."

if ! xcrun simctl list devices booted | grep -q "(Booted)"; then
  fail "No booted iOS Simulator found. Boot one with Xcode or run: open -a Simulator"
fi

mkdir -p "$ARTIFACT_DIR"

log_info "Running Maestro iOS smoke for app id $APP_ID"
log_info "Artifacts: $ARTIFACT_DIR"

maestro test \
  -e APP_ID="$APP_ID" \
  -e ARTIFACT_DIR="$ARTIFACT_DIR" \
  "$FLOW_FILE" 2>&1 | tee "$LOG_FILE"
