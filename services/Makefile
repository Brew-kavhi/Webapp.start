include ../.env
# Define the command for golangci-lint and goimports
MODULES :=
GOLANGCI_LINT = $(shell which golangci-lint)
GOIMPORTS = $(shell which goimports)

COMPOSE_FILE = ../docker-compose.yaml
FRONTEND_DIR = frontend
SERVICES_DIR = .
makeFileDir := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

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
	$(eval CAPITALIZED_NAME=$(shell echo $(module) | sed 's/.*/\u&/'))
	@echo "generating stubs for module $(module)"
	@cd $(module) && openapi-generator-cli generate -i api_scheme.yaml -g go-server -o . -t ../../.ressources/templates/openapi/go-server;\
	go get gorm.io/gorm; \
	go get gorm.io/driver/sqlite; \
	go get github.com/rs/cors; \
	go mod tidy; \
	echo "go/api_$(module)_service.go" >> .openapi-generator-ignore; \
	sed -e 's/{{MODULE}}/$(module)/g' \
		-e 's/{{CAP_MODULE}}/$(CAPITALIZED_NAME)/g' \
			../../.ressources/templates/services/database.go > go/$(module)DB.go; \
	echo "adding the databae connection to main.go"; \


	

.PHONY: generate-compose
generate-compose:
	@cd ../frontend && npm run generate-openapi
	@cp ../.ressources/templates/docker-compose.yaml ../docker-compose.yaml
	@find $(SERVICES_DIR) -maxdepth 1 -type d -not -name 'user' -not -name '.*' -not -name '.' | while read service; do \
		service_name=$$(basename $$service); \
		echo "  $$service_name-service:" >> $(COMPOSE_FILE); \
		echo "    extends:" >> $(COMPOSE_FILE); \
		echo "      file: ./services/$$service_name/$$service_name""_service.docker.yaml" >> $(COMPOSE_FILE); \
		echo "      service: $$service_name-service" >> $(COMPOSE_FILE); \
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
	echo "running Kong in a standalone docker container"; \
	echo "You should consider running kong from docker-compose in a network with all the other services"; \
	docker pull kong@latest; \
	echo "checking for the kong configuration"
	@if ! [ -f "kong.yaml" ]; then \
		echo "file does not exist, creating one.";\
		cd ../frontend && npm run generate-openapi; \
	fi;
	# TODO add here some dns information
	docker run -it --name kong-dbless \
		--mount type=bind,source=${makeFileDir}services/kong.yaml,target=/kong/declarative/kong.yml \
	--security-opt apparmor=unconfined \
	-e "KONG_DATABASE=off" \
	-e "KONG_DECLARATIVE_CONFIG=/kong/declarative/kong.yml" \
	-e "KONG_PROXY_ACCESS_LOG=/dev/stdout" \
	-e "KONG_ADMIN_ACCESS_LOG=/dev/stdout" \
	-e "KONG_PROXY_ERROR_LOG=/dev/stderr" \
	-e "KONG_ADMIN_ERROR_LOG=/dev/stderr" \
	-e "KONG_ADMIN_LISTEN=0.0.0.0:8001, 0.0.0.0:8444 ssl" \
	-e "KONG_ADMIN_GUI_URL=http://localhost:8002" \
	-p ${KONG_PORT}:8000 kong
	

.PHONY: user-service
user-service:
	echo "Creating a user service"; \
	mkdir -p user; \
	cp -a ../.ressources/templates/user_service/* user;\
	echo "Initializing go module"; \
	cd user && go mod init user; \
	echo "Installing GORM (GO object relation manager)"; \
	go get -u gorm.io/gorm; \
	go get golang.org/x/crypto/bcrypt; \
	go get -u github.com/rs/cors; \
	go get -u github.com/pquerna/otp/totp; \
	go get -u github.com/joho/godotenv; \
	go get -u gorm.io/driver/sqlite; \
	go get -u github.com/go-webauthn/webauthn; \
	go get -u github.com/golang-jwt/jwt; \
	go mod tidy; \
	

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
		echo "installing dotenv environment"; \
		go get -u github.com/joho/godotenv; \
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
		sed \
			-e 's/{{MODULE}}/$(CAPITALIZED_NAME)/g' \
			../../.ressources/templates/services/api_scheme.yaml > api_scheme.yaml; \
		sed \
			-e 's/{{name}}/$(name)/g' \
			../../.ressources/templates/services/service.docker.yaml > $(name)-service.docker.yaml; \
		echo "Creating $(name)_test.go for $(name)"; \
		cp ../../.ressources/templates/services/middleware.go middleware.go; \
		cp ../../.ressources/templates/services/utils.go utils.go; \
		echo 'package main\n\nimport "testing"\n\nfunc TestMain(t *testing.T) {\n\texpected := "Hello, world!"\n\tactual := "Hello, world!"\n\tif actual != expected {\n\t\tt.Errorf("expected %v, got %v", expected, actual)\n\t}\n}' > $(name)_test.go; \
		go get github.com/stretchr/testify; \
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

