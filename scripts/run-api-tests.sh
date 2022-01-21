#!/bin/sh

script="$(dirname $0)/../docker-compose-api-tests.yml"
docker compose -p tests -f $script up --build -d

TESTS_RUNNER_CONTAINER_ID=$(docker ps -aqf "name=^tests-api-tests-runner-1$")
TEST_EXIT_CODE=`docker wait $TESTS_RUNNER_CONTAINER_ID`

# Log tests results
docker logs $TESTS_RUNNER_CONTAINER_ID

# Clean
docker-compose -p tests kill
docker-compose -p tests rm -f

exit $TEST_EXIT_CODE
