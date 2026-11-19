# Same as ../Dockerfile except the build skips `yarn abis`, which downloads ABIs
# from a live public chain API. The api process does not read them, and the
# harness must not depend on, or send traffic to, an external service.
# Keep the install and build steps in line with ../Dockerfile.
FROM node:24-alpine AS build

RUN mkdir -p /var/www/api

ADD scripts /var/www/api/scripts
ADD src /var/www/api/src

COPY config.js package.json tsconfig.json yarn.lock .yarnrc /var/www/api/

WORKDIR /var/www/api

RUN yarn install --frozen-lockfile --ignore-scripts --ignore-optional

RUN yarn check-config && yarn clean && yarn tsc && yarn copy-files


# Same shape as the production stage of ../Dockerfile, so the harness tests an
# image without the dev dependencies.
FROM node:24-alpine AS production

RUN mkdir -p /var/www/api

WORKDIR /var/www/api

COPY package.json yarn.lock .yarnrc /var/www/api/

RUN yarn install --frozen-lockfile --production --ignore-scripts --ignore-optional \
  && yarn cache clean

COPY --from=build /var/www/api/dist /var/www/api/dist
COPY --from=build /var/www/api/scripts /var/www/api/scripts
COPY --from=build /var/www/api/config.js /var/www/api/config.js
