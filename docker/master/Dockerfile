FROM node:10-alpine

WORKDIR app

COPY package.json package-lock.json ./

COPY ./src/master ./src/master
COPY ./src/utils ./src/utils
COPY ./src/operations ./src/operations

RUN npm i
