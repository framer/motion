###### This is coming from our shared.mk in the FramerStudio repo

# Include node modules in the path
PATH := $(CURDIR)/node_modules/.bin:$(PATH)

# Use a modern shell
SHELL := /bin/bash

# Default target is build
default: build

# Cleaning removes build dir and node_modules. Use double colon so it can be extended.
clean::
	rm -rf build
	rm -rf node_modules
	git clean -fdX .

# Update node modules if package.json is newer than node_modules or yarn lockfile
# Use a mutex file so multiple Source dirs can be built in parallel.
node_modules/.yarn-integrity: yarn.lock package.json
	yarn install --mutex network
	touch $@

bootstrap:: node_modules/.yarn-integrity
SOURCE_FILES := $(shell find ./src -type f)

######

# The location to gather test reports
TEST_REPORT_PATH := $(if $(CIRCLE_TEST_REPORTS),$(CIRCLE_TEST_REPORTS),$(CURDIR)/test_reports)
API_TARGET=api/framer.api.json
DECLARATION_TARGET=types/index.d.ts

build: bootstrap
	yarn build

dev: bootstrap
	webpack-dev-server --config=dev/webpack/config.js

watch: bootstrap
	if test -f coverage/lcov-report/index.html; then \
	 open coverage/lcov-report/index.html; \
	fi;
	yarn watch

bump:
	npm version patch

publish: clean
	npm publish

test: bootstrap
	mkdir -p $(TEST_REPORT_PATH)
	JEST_JUNIT_OUTPUT=$(TEST_REPORT_PATH)/framer-motion.xml yarn test $(if $(CI),--ci --reporters=jest-junit)

lint: bootstrap
	tslint --project tsconfig.json --fix

pretty: bootstrap
	prettier --write */**/*.tsx */**/*.ts

$(DECLARATION_TARGET): $(SOURCE_FILES)
	yarn tsc -p . --emitDeclarationOnly --removeComments false

$(API_TARGET): api-extractor.json $(DECLARATION_TARGET)
	yarn api-extractor run -l

api: bootstrap $(API_TARGET)

docs: bootstrap $(API_TARGET)
	yarn api-documenter markdown --input-folder api --output-folder docs

.PHONY: dev lint
