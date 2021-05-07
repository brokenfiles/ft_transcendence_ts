#!/bin/bash

# install dependencies
yarn install

#exec main process (in docker-compose service)
exec "$@"
