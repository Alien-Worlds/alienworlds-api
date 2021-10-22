FROM node:12.18.1

WORKDIR /dist

COPY dist/ . 
