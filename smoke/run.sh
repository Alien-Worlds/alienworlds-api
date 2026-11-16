#!/bin/sh
# Usage: smoke/run.sh [record|check]   (default: check)
# Builds the image from the repo Dockerfile, starts mongo, a mock chain and the
# api on an internal network (no internet), seeds fixed data, and runs run.js.
set -eu
cd "$(dirname "$0")"
MODE="${1:-check}"
trap 'docker compose down -v --remove-orphans >/dev/null 2>&1' EXIT
MODE="$MODE" docker compose up --build --abort-on-container-exit --exit-code-from runner
