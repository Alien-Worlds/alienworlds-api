#!/bin/sh

script="$(dirname $0)/../docker-compose-api-tests.yml"
docker compose -f $script up --build --abort-on-container-exit --exit-code-from api-tests
