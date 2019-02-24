FROM node:10-alpine

WORKDIR app

COPY package.json package-lock.json ./

COPY ./src/worker ./src/worker
COPY ./src/utils ./src/utils

COPY ./data ./data

RUN npm i
