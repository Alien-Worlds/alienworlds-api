FROM node:24-alpine

RUN apk add curl python3 make g++

RUN mkdir -p /var/www/api

ADD scripts /var/www/api/scripts
ADD src /var/www/api/src

COPY config.js package.json tsconfig.json yarn.lock /var/www/api/

WORKDIR /var/www/api

RUN yarn install --frozen-lockfile --ignore-scripts
RUN yarn build
