# Define the command for golangci-lint and goimports
MODULES :=
GOLANGCI_LINT = $(shell which golangci-lint)
GOIMPORTS = $(shell which goimports)

COMPOSE_FILE = ../docker-compose.yml
FRONTEND_DIR = frontend
SERVICES_DIR = .

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
		echo "Initializing go module"; \	
		cd $(name) && go mod init $(name); \
		echo "Installing GORM (GO object relation manager)"; \
		go get -u gorm.io/gorm; \
		echo "Installing Kafka for event messaging"; \
		go get github.com/segmentio/kafka-go; \
		echo "Installing mux for routing"; \
		go get github.com/gorilla/mux; \
		echo "Adding $(name) to MODULES"; \
		sed -i.bak '/^MODULES := / s/$$/ $(name)/' $(MAKEFILE_LIST); \
		echo "$(name) added to MODULES"; \
		echo "Creating Dockerfile for $(name)"; \
		echo 'FROM golang:alpine\nWORKDIR /app\nCOPY . .\nRUN go build -o /$(name)\nEXPOSE 8080\nCMD ["/$(name)"]' > Dockerfile; \
		echo "Creating main.go for $(name)"; \
		echo 'package main\n\nimport (\n\t"fmt"\n\t"log"\n\t"net/http"\n)\n\nfunc main() {\n\tfmt.Println("Hello, world!")\n}' > main.go; \
		echo "Creating a base model"; \
		echo 'package main\n\nimport "gorm.io/gorm"\n\ntype $(name) struct (\n\tgorm.model\n)' > models.go; \
		echo "creating handler.go"; \
		echo 'package main\n\nimport (\n\t"encoding/json"\n\t"net/http"\n\t"text/template"\n)\n\ntype $(name)Request struct {\n\tproperty string `json:property`\n}\n\nfunc $(name)Handler(w http.ResponseWriter, r *http.Request) {\n\tvar req $(name)Request\n\tif err := json.NewDecoder(r.Body).Decode(&req); err != nil {\n\t\treturn\n\t}\n\t //Do something wit h the data in req\n\ttmpl := template.Must(template.ParseFiles("templates/$(name)_index.html"))\n\ttmpl.Execute(w, nil)\n}' > handler.go; \
		echo "creating router.go"; \
		echo 'package main\n\nimport (\n\t"github.com/gorilla/mux"\n\t"net/http"\n)\n\nfunc $(name)Router() *mux.Router {\n\trouter := mux.NewRouter()\n\trouter.HandleFunc("/$(name)", $(name)Handler).Methods("POST")\n\treturn router\n}' > router.go; \
		echo "creating middleware.go"; \
		echo "" > middleware.go; \
		echo "Creating $(name)_test.go for $(name)"; \
		echo 'package main\n\nimport "testing"\n\nfunc TestMain(t *testing.T) {\n\texpected := "Hello, world!"\n\tactual := "Hello, world!"\n\tif actual != expected {\n\t\tt.Errorf("expected %v, got %v", expected, actual)\n\t}\n}' > $(name)_test.go; \
		go get github.com/stretchr/testify; \
		echo "creating folder for html templates"; \
		mkdir templates; \
		touch templates/$(name)_index.html; \
		echo "Adding service to docker compose"; \
		cd ..; \
		$(eval LEN := $(shell printf '%s' '$(subst ','"'"',$(MODULES))' | wc -c))\
		echo "  $$name:" >> $(COMPOSE_FILE); \
		echo "    build: ./services/$$name" >> $(COMPOSE_FILE); \
		echo "    ports:" >> $(COMPOSE_FILE); \
		echo "      - '808$(LEN):8080'" >> $(COMPOSE_FILE); \
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

