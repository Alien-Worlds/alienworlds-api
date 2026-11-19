# Two stages. `build` has every dependency (TypeScript, eslint, redoc-cli, ...) and
# compiles the code. `production` (the default target) has only the production
# dependencies and the compiled output, so the dev tooling is not shipped.
#
# In the production stage `yarn api`, `yarn processor`, `yarn filler` and `yarn
# blockrange` run the compiled code (`node dist/x.js`) instead of tsc-watch, so the
# usual start commands still work; there is just no live recompiling. To get the
# tooling back (tsc, tsc-watch, eslint, redoc-cli): docker build --target build .

FROM node:24-alpine AS build

RUN apk add curl python3 make g++

RUN mkdir -p /var/www/api

ADD scripts /var/www/api/scripts
ADD src /var/www/api/src

COPY config.js package.json tsconfig.json yarn.lock .yarnrc /var/www/api/

WORKDIR /var/www/api

RUN yarn install --frozen-lockfile --ignore-scripts --ignore-optional
RUN yarn build


FROM node:24-alpine AS production

RUN apk add --no-cache curl

RUN mkdir -p /var/www/api

WORKDIR /var/www/api

COPY package.json yarn.lock .yarnrc /var/www/api/
COPY scripts/use-compiled-scripts.js /tmp/use-compiled-scripts.js

# `yarn api`, `yarn processor`, `yarn filler` and `yarn blockrange` run tsc-watch, a dev
# dependency. Make them run the compiled code instead, so existing start commands work.
RUN node /tmp/use-compiled-scripts.js package.json && rm /tmp/use-compiled-scripts.js

RUN yarn install --frozen-lockfile --production --ignore-scripts --ignore-optional \
  && yarn cache clean

COPY --from=build /var/www/api/dist /var/www/api/dist
COPY --from=build /var/www/api/scripts /var/www/api/scripts
COPY --from=build /var/www/api/config.js /var/www/api/config.js
