###### This is coming from our common.mk in the FramerStudio repo
# Path of this file, includes trailing slash
# NOTE: Should not be used in files that import this one, use BASE_DIR instead.
__DIR__ := $(dir $(lastword $(MAKEFILE_LIST)))


# Root path of the repository, absolute (no slash suffix)
BASE_DIR := $(abspath $(__DIR__))


# Include node modules in the path
PATH := $(CURDIR)/node_modules/.bin:$(PATH)

# Use a modern shell
SHELL := /bin/bash

# Default target is build
default: build

# Cleaning removes build dir and node_modules. Use double colon so it can be extended.
clean::
	rm -rf build
	find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
	git clean -fdX .

# Use a mutex file so multiple Source dirs can be built in parallel.
WORKTREE_NODE_MODULES := $(BASE_DIR)/node_modules/.yarn-state.yml
WORKSPACE_NODE_MODULES := node_modules

# Update node modules if package.json is newer than node_modules or yarn lockfile
$(WORKTREE_NODE_MODULES) $(WORKSPACE_NODE_MODULES): $(BASE_DIR)/yarn.lock package.json packages/framer-motion/package.json packages/framer-motion-3d/package.json
	yarn install
	touch $@

# Install requirements, this should usually be the first dependency of build.
# Only install the worktree (root) node_modules by default. If a package has it‘s own
# node_modules, include a rule that says `bootstrap:: $(WORKSPACE_NODE_MODULES)` in the
# Makefile
bootstrap:: $(WORKTREE_NODE_MODULES)

SOURCE_FILES := $(shell find packages/framer-motion/src packages/framer-motion-3d/src -type f)

######

# The location to gather test reports
TEST_REPORT_PATH := $(if $(CIRCLE_TEST_REPORTS),$(CIRCLE_TEST_REPORTS),$(CURDIR)/test_reports)
DECLARATION_TARGET=types/index.d.ts

build: bootstrap
	cd packages/motion && yarn build
	cd packages/three && yarn build

watch: bootstrap
	yarn watch

test-watch: bootstrap
	if test -f coverage/lcov-report/index.html; then \
	 open coverage/lcov-report/index.html; \
	fi;
	yarn test-watch

bump:
	npm version patch

publish: clean bootstrap
	npm publish
	git push

test: bootstrap
	yarn test

test-ci: bootstrap
	mkdir -p $(TEST_REPORT_PATH)
	JEST_JUNIT_OUTPUT=$(TEST_REPORT_PATH)/framer-motion.xml yarn test-ci

lint: bootstrap
	yarn lint

pretty: bootstrap
	prettier --write */**/*.tsx */**/*.ts

$(DECLARATION_TARGET): $(SOURCE_FILES)
	yarn tsc -p . --emitDeclarationOnly --removeComments false

.PHONY: dev lint
