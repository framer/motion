###### This is coming from our shared.mk in the FramerStudio repo

# Include node modules in the path
PATH := $(CURDIR)/node_modules/.bin:$(PATH)

# Use a modern shell
SHELL := /bin/bash

# Update node modules if package.json is newer than node_modules or yarn lockfile
# Use a mutex file so multiple Source dirs can be built in parallel.
node_modules/.yarn-integrity: yarn.lock package.json
	yarn install --mutex network
	touch $@

bootstrap:: node_modules/.yarn-integrity

######

dev: bootstrap
	webpack-dev-server --config=dev/webpack/config.js

test: bootstrap
	yarn test

lint: bootstrap
	tslint --project tsconfig.json --fix

pretty: bootstrap
	prettier --write */**/*.tsx */**/*.ts

.PHONY: dev lint
