# Brew.kavhi
This repository serves as a starting point for a certain kind of webapp project. In this case, the backend is written in GO consisting of mutliple microservices that are each their own go module, to keep the benefits of microservices in terms of independence and manageability. The frontend will be in htmx with webcomponents, although this structure is not hard enforced, its just the way it is intended by the maintainer of this repo.

This repo comes with a basic eslinter configuration and prettier configuration as well s golang linter configuration. So you can use this repo as starting point and start coding right away without the hustle of setting up some configuration and stuff.



## Getting started

This project is a monorepo for the backend and the frontend. Backend is written in go and frontend is written in htmx with webcomponents. This repository depends on go, make and node, so before continuing make sure these are installed on your system. 
To get started after cloning this repo, install all necessary frontend depenencies on your system with npm -i in the frontend folder. 

## Add your files

This repository of course follows some rules, like never pushing un formatted code and commit conventions. These conventions are all listed belows and the important ones are enforced through pipelines.
- [ ] run npm run lint before pushing frontend code
- [ ] run npm run format before pushing frontend code
- [ ] run make lint-module module=<module_name>(in the service/ directory) before pushing service code
- [ ] run make format-module module=<module_name>(in the service/ directory) before pushing service code
- [ ] if you add a module run make create-service name=<name> and add it to the modules list at the top of the makefile.
- [ ] changes must only be within one subfolder, so a commit can never contain changes in the frontend and a microservice or changes in tow different microservices.


## Test and Deploy

This repository comes with testing frameworks, so to conduct the tests for the backend run make test, for testing of the the frontend run npm run test
Deployment is done with docker. Therefor each service creted with make already contains a basic dockerfile, that can be used to deploy this service.

## Roadmap
In the future this repo will also contain the necessary files for docker-compose so a docker cluster can be setup easily. Furthermore, we will enforce rules by github actions and gitlab pipelines. This will ship with later versions of this repository 

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

