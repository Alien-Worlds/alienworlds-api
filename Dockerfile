FROM node:17-alpine3.12

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

RUN apk add curl

RUN mkdir -p /var/www/api

ADD scripts /var/www/api/scripts
ADD src /var/www/api/src

COPY package.json .npmrc tsconfig.json yarn.lock /var/www/api/

WORKDIR /var/www/api

RUN yarn
RUN yarn build
