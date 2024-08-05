# Define the command for golangci-lint and goimports
MODULES :=
GOLANGCI_LINT = $(shell which golangci-lint)
GOIMPORTS = $(shell which goimports)

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
	@cd $(module) && go run .

.PHONY: create-service
create-service:
	@if [ -z "$(name)" ]; then \
		echo "Usage: make create-service name=<service_name>"; \
		exit 1; \
	fi
	@if echo $(MODULES) | grep -w $(name) > /dev/null; then \
		echo "$(name) is already in MODULES"; \
	else \
		echo "Creating new service $(name)"; \
		mkdir -p $(name); \
		cd $(name) && go mod init $(name); \
		echo "Adding $(name) to MODULES"; \
		sed -i.bak '/^MODULES := / s/$$/ $(name)/' $(MAKEFILE_LIST); \
		echo "$(name) added to MODULES"; \
		echo "Creating Dockerfile for $(name)"; \
		echo 'FROM golang:alpine\nWORKDIR /app\nCOPY . .\nRUN go build -o /$(name)\nCMD ["/$(name)"]' > $(name)/Dockerfile; \
		echo "Creating main.go for $(name)"; \
		echo 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, world!")\n}' > $(name)/main.go; \
		echo "Creating $(name)_test.go for $(name)"; \
		echo 'package main\n\nimport "testing"\n\nfunc TestMain(t *testing.T) {\n\texpected := "Hello, world!"\n\tactual := "Hello, world!"\n\tif actual != expected {\n\t\tt.Errorf("expected %v, got %v", expected, actual)\n\t}\n}' > $(name)/$(name)_test.go; \
		go get github.com/stretchr/testify; \
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

