#!/bin/sh

PROD_COMPOSE="$(dirname "$0")/../docker-compose.prod.yml"
docker compose -p alienworlds -f "$PROD_COMPOSE" up --build
exit $?
