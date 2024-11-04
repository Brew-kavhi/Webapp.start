# Brew.kavhi
This repository serves as a starting point for a certain kind of webapp project. In this case, the backend is written in GO consisting of mutliple microservices that are each their own go module, to keep the benefits of microservices in terms of independence and manageability. The frontend will be in htmx with webcomponents, although this structure is not hard enforced, its just the way it is intended by the maintainer of this repo.

This repo comes with a basic eslinter configuration and prettier configuration as well s golang linter configuration. So you can use this repo as starting point and start coding right away without the hustle of setting up some configuration and stuff.


## Getting started

This project is a monorepo for the backend and the frontend. Backend is written in go and frontend is written in htmx with webcomponents. This repository depends on go, make and node, so before continuing make sure these are installed on your system. 
To get started after cloning this repo, install all necessary frontend depenencies on your system with npm -i in the frontend folder. 

### Dependencies
For auto generating the go models we rely on openapi-generator. This can globally be installed with ``npm install @openapitools/openapi-generator-cli -g``. See [here](https://openapi-generator.tech/) for more details.

## Add your files

This repository of course follows some rules, like never pushing un formatted code and commit conventions. These conventions are all listed belows and the important ones are enforced through pipelines.
- [ ] run npm run lint before pushing frontend code
- [ ] run npm run format before pushing frontend code
- [ ] run make lint-module module=<module_name>(in the service/ directory) before pushing service code
- [ ] run make format-module module=<module_name>(in the service/ directory) before pushing service code
<<<<<<< HEAD
- [ ] changes must only be within one subfolder, so a commit can never contain changes in the frontend and a microservice or changes in tow different microservices.
- [ ] if you add a module run make create-service name=<name> and add it to the modules list at the top of the makefile.
The first 5 rules are enforced using github actions and gitlab pipelines.
=======
- [ ] if you add a module run make create-service name=<name> and add it to the modules list at the top of the makefile.
- [ ] changes must only be within one subfolder, so a commit can never contain changes in the frontend and a microservice or changes in tow different microservices.
>>>>>>> a277429 (fix(README): merge errors")

## Test and Deploy

This repository comes with testing frameworks, so to conduct the tests for the backend run make test, for testing of the the frontend run npm run test
Deployment is done with docker. Therefor each service creted with make already contains a basic dockerfile, that can be used to deploy this service.

## Features
This framework comes with a few default implementations of regularly used features.
**Backend:**
- [x] User service:
    - [x] login/logout
    - [x] Passowrd reset
    - [x] two factor authentication using authenticator app on client
    - [x] Webauthn
    - [x] Register new users
    - [x] Edit profile
- [x] Microservices
    - [x] autogenerate go microservices from an openapi scheme. The service comes fully usable out of the box with database connection (to sqlite per default), automigrations and access functions.
    - [x] Each service contains a dockerfile for easy deployment
    - [x] input validation against minimum, maximum, minLength and maxLength specs from openapi-scheme
- [x] Authentication using json web token
- [x] Kong api gateway
    - [x] Setup of a kong api gateway to handle microservices and frontend with one endpoint
**Frontend:**
- [x] Multilingual frontend using i18next
- [x] Custom Router, that handles loading components
    - [x] define routes in js/routes.ts as json.
- [x] Vite build with plugin to load html for webcomponents from separate files and inject as template literal string.
- [x] Autogenerate webcomponents based on openapi scheme
    - [x] Card: displays a brief overview of an entity
    - [x] List: Holds a list of cards
    - [x] Form: Displays a form for creating a new entity
    - [x] Deails: display details / all information of an entity
- [x] autogenerate API using openapi-generator
- [x] QR-Code scanner component.
- [x] PWA start point
- [x] Toast component
**Dev:**
- [x] extract all i18n keys automatically
- [x] formating and linting

## Usage
The backend contains a make file with all related functionalities, like:
- make user-service: generates the user service with all authentication mechanism...
- make create-service name=<name>: generates a base for a new microservice. That is, intall a few packages, a default api-scheme...
- make generte-stubs module=<name>: using openapi-generator the server stubs for the specified are generated. This also inclues a sqlite database handler.
- make run-kong: runs kong in a docker container
Most of this, relies on a few templates that are defined in .ressources/templates. Also if you want to customize the openapi-generator, some templates therefor are also given.

For the frontend we also have a few commands that make your life easier:
- npm run lint: lints all modules
- npm run format: formats all modules
- npm run dev: runs dev server
- npm run generate-openapi: This generates kong config file and merges all microservice api schemes from the backend into one api-scheme for the frontend.
- npm run generate-api: generates the api for the frontend.
- npm run build: builds a web application.
- npm run i18n-keys: extract all translation keys from the html files.
- npm run model-components <name>: creates the card, list, detail and form component from the microservice specified with <name>

## Roadmap
In the future this repo will also contain the necessary files for docker-compose so a docker cluster can be setup easily. Furthermore, we will enforce rules by github actions and gitlab pipelines. AS of now, only some basic actions and pipelines are defined on main branch, but for other branches there will be ore rules following.
<<<<<<< HEAD

=======
>>>>>>> a277429 (fix(README): merge errors")
