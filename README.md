# Mauro Data Explorer

A web application to browse a Mauro metadata catalogue and request access to particular data via the organisation.

# Requirements

This codebase is built on Angular 13, so the following are required:

* NodeJS
* NPM
* [Angular CLI](https://github.com/angular/angular-cli)

Also, you will need a Mauro backend instance running to communicate data between the server and this web application. Please use [mdm-application-build](https://github.com/MauroDataMapper/mdm-application-build) as a development backend.

# Installation

```bash
# Clone repo
git clone https://github.com/MauroDataMapper/mdm-research-browser.git

# Install Angular CLI
npm install -g @angular/cli

# Install the dependencies
npm install
```

# Running the app

```bash
# Serve a development instance of the Angular app
# All code changes will automatically be watched and refresh the app as you go
# View the application from http://localhost:4201/
npm start

# Run the test suite...
npm run test

# ...or run and write the tests as you develop
npm run test:watch
```

# Other commands

```bash
# Build the project artefacts for distribution. Will output to dist/mdm-research-browser
npm run build

# Run linting on the code
npm run eslint

# Check all license headers are present in source files
npm run license-check check

# Add missing license headers
npm run license-check add
```

# Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

# mdm-resources

We have a dependency on another repository ([mdm-resources](https://github.com/MauroDataMapper/mdm-resources)) which we develop.

The `package.json` file is configured to use the latest release of this module into the NPM registry, however if you are developing `mdm-resources` alongside this repo or you know there are changes which have not yet been released you will need to do the following:

1. Clone the `mdm-resources` repository
2. Link the `mdm-resources` repository into your global npm
3. Link `mdm-resources` into mdm-research-browser`

Once you have linked the `mdm-resources` repo into the global npm it will remain there until you unlink it, you will have to re-build (`npm run build`) `mdm-resources` with each change for those changes to be picked up by `mdm-research-browser`, however you dont have to re-link after the rebuild.

## Linking to mdm-resources

If you run `npm install` inside this repo you will have to re-run the final link step below to re-link mdm-resources into mdm-ui.

```bash
# Clone mdm-resources
git clone git@github.com:MauroDataMapper/mdm-resources.git

# Link mdm-resources to global npm
cd mdm-resources
npm install
npm run build
npm link

# Link mdm-resources into mdm-research-browser
cd mdm-research-browser
npm link @maurodatamapper/mdm-resources
```

## Unlinking from mdm-resources

Simply run `npm install` or `npm ci` to remove previous links.

## Useful Tool for Links

There is a useful npm package ([symlinked](https://www.npmjs.com/package/symlinked)) which can list what modules are linked into your repository.
This is helpful if you want to check if `mdm-resources` is currently linked to `mdm-research-browser`.

We recommend installing this globally with `npm install -g symlinked` then you can call it inside `mdm-research-browser` using `symlinked names`.
