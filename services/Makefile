include ../.env
# Define the command for golangci-lint and goimports
MODULES :=
GOLANGCI_LINT = $(shell which golangci-lint)
GOIMPORTS = $(shell which goimports)

COMPOSE_FILE = ../docker-compose.yml
FRONTEND_DIR = frontend
SERVICES_DIR = .

OPENAPI_GENERATOR_VERSION := $(shell openapi-generator-cli --version 2>/dev/null)

# Ensure that golangci-lint is installed
.PHONY: check-golangci-lint
check-golangci-lint:
ifndef GOLANGCI_LINT
	$(error "golangci-lint is not installed. Please install it by running 'go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest'")
endif

# Ensure that goimports is installed
.PHONY: check-goimports
check-goimports:
ifndef GOIMPORTS
	$(error "goimports is not installed. Please install it by running 'go install golang.org/x/tools/cmd/goimports@latest'")
endif

# Lint target
.PHONY: lint
lint:
	@for module in $(MODULES); do \
		echo "Linting $$module"; \
		cd $$module && golangci-lint run; \
		cd - > /dev/null; \
	done

# Lint a specific module
.PHONY: lint-module
lint-module:
	@if [ -z "$(module)" ]; then \
		echo "Usage: make lint-module module=<module_name>"; \
		exit 1; \
	fi
	@echo "Linting $(module)"
	@cd $(module) && golangci-lint run


# Format target
.PHONY: format format-module
format: 
	@for module in $(MODULES); do \
		echo "Formatting $$module"; \
		cd $$module && goimports -w .; \
		cd - > /dev/null; \
	done

# Format a specific module
format-module:
	@if [ -z "$(module)" ]; then \
		echo "Usage: make format-module module=<module_name>"; \
		exit 1; \
	fi
	@echo "Formatting $(module)"
	@cd $(module) && goimports -w .

.PHONY: generate-stubs
generate-stubs:
	@command -v openapi-generator-cli >/dev/null 2>&1 || { echo "Openapi-generator not found, consider installing it using npm install @openapitools/openapi-generator-cli -g"; exit 1; }
	@echo "Openapi-generator found"
	@if [ -z "$(module)" ]; then \
		echo "Usage: make generate-stubs module=<module_name>"; \
		exit 1; \
	fi
	@echo "generating stubs for module $(module)"
	@cd $(module) && openapi-generator-cli generate -i api_scheme.yaml -g go-server -o .;\
	go mod tidy; \
	echo "adding the databae connection to main.go"; \


	

.PHONY: generate-compose
generate-compose:
	@echo "version: '3.8'" > $(COMPOSE_FILE)
	@echo "services:" >> $(COMPOSE_FILE)
	@echo "  frontend:" >> $(COMPOSE_FILE)
	@echo "    build: ./$(FRONTEND_DIR)" >> $(COMPOSE_FILE)
	@echo "    ports:" >> $(COMPOSE_FILE)
	@echo "      - '80:80'" >> $(COMPOSE_FILE)
	@echo "    environment:" >> $(COMPOSE_FILE)
	@echo "      - ENV_VAR=example_value" >> $(COMPOSE_FILE)
	@find $(SERVICES_DIR) -maxdepth 1 -type d -not -name '.*' -not -name '.' | while read service; do \
		service_name=$$(basename $$service); \
		echo "  $$service_name:" >> $(COMPOSE_FILE); \
		echo "    build: ./services/$$service" >> $(COMPOSE_FILE); \
		echo "    ports:" >> $(COMPOSE_FILE); \
		echo "      - '808$${service_name##service}:8080'" >> $(COMPOSE_FILE); \
		echo "    environment:" >> $(COMPOSE_FILE); \
		echo "      - ENV_VAR=example_value" >> $(COMPOSE_FILE); \
	done

# Build all modules
.PHONY: test-integration test-integration-module
test-integration:
	@for module in $(MODULES); do \
		echo "Building $$module"; \
		cd $$module && go test -o ../bin/$$module; \
		cd - > /dev/null; \
	done

# test-integration a specific module
test-integration-module:
	@if [ -z "$(module)" ]; then \
		echo "Usage: make build-module module=<module_name>"; \
		exit 1; \
	fi
	@echo "Building $(module)"
	@cd $(module) && go test -o ../bin/$(module)
# Build all modules
.PHONY: build build-module
build:
	@for module in $(MODULES); do \
		echo "Building $$module"; \
		cd $$module && go build -o ../bin/$$module; \
		cd - > /dev/null; \
	done

# Build a specific module
build-module:
	@if [ -z "$(module)" ]; then \
		echo "Usage: make build-module module=<module_name>"; \
		exit 1; \
	fi
	@echo "Building $(module)"
	@cd $(module) && go build -o ../bin/$(module)

# Test all modules
.PHONY: test test-module
test:
	@for module in $(MODULES); do \
		echo "Testing $$module"; \
		cd $$module && go test ./...; \
		cd - > /dev/null; \
	done

# Test a specific module
test-module:
	@if [ -z "$(module)" ]; then \
		echo "Usage: make test-module module=<module_name>"; \
		exit 1; \
	fi
	@echo "Testing $(module)"
	@cd $(module) && go test ./...

# Clean build artifacts
.PHONY: clean
clean:
	@rm -rf bin/*

# Run a specific module
.PHONY: run
run:
	@if [ -z "$(module)" ]; then \
		echo "Usage: make run module=<module_name>"; \
		exit 1; \
	fi
	@echo "Running $(module)"
	@cd $(module) && go run main.go

.PHONY: run-kong
run-kong:
	echo "creating the docker network"; \
	docker network create kong-net; \
	docker pull kong@latest; \
	echo "checking for the kong configuration"
	@if ! [ -f "kong.yml" ]; then \
		echo "file does not exist, creating one.";\
		cd ../frontend && npm run generate-openapi; \
	fi;
	docker run -d --name kong-dbless --network=kong-net -v "$(pwd):/kong/declarative/" \
	-e "KONG_DATABASE=off" \
	-e "KONG_DECLARATIVE_CONFIG=/kong/declarative/kong.yml" \
	-e "KONG_PROXY_ACCESS_LOG=/dev/stdout" \
	-e "KONG_ADMIN_ACCESS_LOG=/dev/stdout" \
	-e "KONG_PROXY_ERROR_LOG=/dev/stderr" \
	-e "KONG_ADMIN_ERROR_LOG=/dev/stderr" \
	-e "KONG_ADMIN_LISTEN=0.0.0.0:8001, 0.0.0.0:8444 ssl" \
	-e "KONG_ADMIN_GUI_URL=http://localhost:8002" \
	-p ${KONG_PORT}:8000 -p 8443:8443 -p 127.0.0.1:${KONG_PORT}:8001 -p 127.0.0.1:8444:8444 kong
	

.PHONY: create-service
create-service:
	@if [ -z "$(name)" ]; then\
		echo "Usage: make create-service name=<service_name>";\
		exit 1;\
	fi
	$(eval CAPITALIZED_NAME=$(shell echo $(name) | sed 's/.*/\u&/'))
	@if echo "$(MODULES)" | grep -w "$(name)" > /dev/null; then \
		echo "$(name) is already in MODULES";\
	else  \
		echo "Creating new service $(name)"; \
		mkdir -p $(name); \
		echo "Initializing go module"; \
		cd $(name) && go mod init $(name); \
		echo "Installing GORM (GO object relation manager)"; \
		go get -u gorm.io/gorm; \
		echo "Installing OpenAPI-codegen"; \
		go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest; \
		echo "Installing Kafka for event messaging"; \
		go get github.com/segmentio/kafka-go; \
		echo "Installing mux for routing"; \
		go get github.com/gorilla/mux; \
		echo "Adding $(name) to MODULES"; \
		sed -i.bak '/^MODULES := / s/$$/ $(name)/' $(MAKEFILE_LIST); \
		echo "$(name) added to MODULES"; \
		echo "Creating a base openapi scheme"; \
		echo "openapi: 3.0.0\ninfo:\n title: API for service '$(name)'\n description: This is the api scheme for service '$(name)', where all models and endpoints for this service are defined\n version: 0.0.1\n\nservers:\n - url: http://localhost:8080\n   description: Local development server\n\npaths:\n /$(name):\n  get:\n   summary: Get all instances of $(name)\n   operationId: list$(CAPITALIZED_NAME)\n   responses:\n    '200':\n     description: A list of instances of $(name)\n     content:\n      application/json:\n       schema:\n        type: array\n        items:\n         \044ref: '#/components/schemas/$(CAPITALIZED_NAME)'\n  post:\n   summary: Create a new instance of $(name)\n   operationId: create$(CAPITALIZED_NAME)\n   requestBody:\n    content:\n     application/json:\n       schema:\n        \044ref: '#/components/schemas/New$(CAPITALIZED_NAME)'\n   responses:\n    '201':\n     description: Instance of $(name) created\n     content:\n      application/json:\n       schema:\n        \044ref: '#/components/schemas/$(CAPITALIZED_NAME)'\ncomponents:\n schemas:\n  $(CAPITALIZED_NAME):\n   type: object\n   properties:\n    id:\n     type: integer\n     format: int64\n    hr_id:\n     type: string\n  New$(CAPITALIZED_NAME):\n   type: object\n   properties:\n    id:\n     type: integer\n     format: int64\n    hr_id:\n     type: string" > api_scheme.yaml; \
		echo "Creating $(name)_test.go for $(name)"; \
		echo 'package main\n\nimport "testing"\n\nfunc TestMain(t *testing.T) {\n\texpected := "Hello, world!"\n\tactual := "Hello, world!"\n\tif actual != expected {\n\t\tt.Errorf("expected %v, got %v", expected, actual)\n\t}\n}' > $(name)_test.go; \
		go get github.com/stretchr/testify; \
		echo "Adding service to docker compose"; \
		cd ..; \
		$(eval LEN := $(shell printf '%s' '$(subst ','"'"',$(MODULES))' | wc -c))\
		echo "  $$name:" >> $(COMPOSE_FILE); \
		echo "    build: ./services/$$name" >> $(COMPOSE_FILE); \
		echo "    ports:" >> $(COMPOSE_FILE); \
		echo "      - '808$(LEN):8080'" >> $(COMPOSE_FILE); \
		echo "Next step: edit the api_scheme to your desire and then autogenerate the boiler plate code by running make generate-stubs module=$$name"; \
	fi



.PHONY: docker-build docker-up docker-down
# Build Docker images for all modules
docker-build:
	@for module in $(MODULES); do \
		echo "Building Docker image for $$module"; \
		docker build -t $$module ./$$module; \
	done

# Start all services using Docker Compose
docker-up:
	@docker-compose up -d

# Stop all services using Docker Compose
docker-down:
	@docker-compose down

.PHONY: generate vendor
# Generate code
generate:
	@for module in $(MODULES); do \
		echo "Generating code for $$module"; \
		cd $$module && go generate ./...; \
		cd - > /dev/null; \
	done

# Manage dependencies
vendor:
	@for module in $(MODULES); do \
		echo "Vendoring dependencies for $$module"; \
		cd $$module && go mod vendor; \
		cd - > /dev/null; \
	done

