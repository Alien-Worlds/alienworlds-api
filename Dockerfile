FROM node:17-alpine3.12

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

RUN apk add curl
RUN npm install -g typescript

RUN mkdir -p /var/www/api

ADD scripts /var/www/api/scripts
ADD src /var/www/api/src

COPY package.json tsconfig.json yarn.lock /var/www/api/

WORKDIR /var/www/api

RUN yarn
RUN yarn build
