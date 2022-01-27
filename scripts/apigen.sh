#!/bin/sh
API_URL=http://api:8800/v1/alienworlds/docs/json

echo "Waiting for the webserver to start"
I=1
until $(curl -m 10 --connect-timeout 10 --output /dev/null --silent --fail ${API_URL}); do
    echo "Waiting... ${I}"
    I=$((I+1))
    sleep 5
done

echo "Downloading API definition from API service"
mkdir -vp openapi
curl --silent ${API_URL} -o openapi/openapi.json

echo "Generating Static API file"
yarn redoc-cli bundle openapi/openapi.json -o openapi/index.html
