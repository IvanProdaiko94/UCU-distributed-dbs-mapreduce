#########################
# PROJECT CONFIGURATION #
#########################

SHELL := /bin/bash

SOURCEDIR=.

VERSION=1.0.0

PROJECT_SOURCE=./src/...

#################
# LAUNCHING_APP #
#################

start:
	docker stack deploy -c docker-compose.yml mapreduce

stop:
	docker stack rm mapreduce
