# Same as ../Dockerfile except the build skips `yarn abis`, which downloads ABIs
# from a live public chain API. The api process does not read them, and the
# harness must not depend on, or send traffic to, an external service.
# Keep the install and build steps in line with ../Dockerfile.
FROM node:24-alpine

RUN mkdir -p /var/www/api

ADD scripts /var/www/api/scripts
ADD src /var/www/api/src

COPY config.js package.json tsconfig.json yarn.lock /var/www/api/

WORKDIR /var/www/api

RUN yarn install --frozen-lockfile --ignore-scripts

RUN yarn check-config && yarn clean && yarn tsc && yarn copy-files
