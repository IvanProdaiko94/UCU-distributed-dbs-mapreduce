FROM node:10-alpine

WORKDIR app

COPY package.json package-lock.json ./

COPY ./src/preprocessor ./src/preprocessor
COPY ./src/utils ./src/utils

COPY ./data ./data

RUN npm i

ARG PRE_DATASET_PATH
ARG PRE_PARTITIONING_FACTOR
ARG PRE_OUTPUT_DIR

ENV PRE_DATASET_PATH=$PRE_DATASET_PATH
ENV PRE_PARTITIONING_FACTOR=$PRE_PARTITIONING_FACTOR
ENV PRE_OUTPUT_DIR=$PRE_OUTPUT_DIR

RUN node ./src/preprocessor
