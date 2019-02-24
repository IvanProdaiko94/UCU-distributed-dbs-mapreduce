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

init:
	docker swarm init

start:
	docker-compose build --no-cache
	docker stack deploy -c docker-compose.yml mapreduce

ls:
	docker stack services mapreduce

logs-master:
	docker service inspect --pretty mapreduce_master
	docker service logs mapreduce_master -f

logs-worker:
	docker service inspect --pretty mapreduce_worker
	docker service logs mapreduce_worker -f

stop:
	docker stack rm mapreduce
	docker swarm leave --force
