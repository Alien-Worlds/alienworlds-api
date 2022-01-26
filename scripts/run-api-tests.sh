#!/bin/sh

TEST_COMPOSE="$(dirname "$0")/../docker-compose-api-tests.yml"
docker compose -p tests -f "$TEST_COMPOSE" build
docker compose -p tests -f "$TEST_COMPOSE" run api-tests-runner
exit $?
