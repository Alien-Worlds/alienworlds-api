#!/bin/sh
printf "Waiting for queue.."
until $(curl --output /dev/null --silent --head --fail -i -u guest:guest http://queue:15672/api/vhosts); do
    printf '.'
    sleep 5
done
echo " Connected to queue."
