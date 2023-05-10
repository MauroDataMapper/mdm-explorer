# Mauro Data Explorer

A web application to browse a Mauro metadata catalogue and request access to particular
data via the organisation.

It is useful to get an overview of the [high-level concepts](docs/CONCEPTS.md) of the
Mauro Data Explorer before diving in. Once you have some familiarity, please follow the
installation and setup instructions below to get started.

# License

All source code under this repository is provided under an Apache 2.0 license under
copyright of University of Oxford, _with the exception of_ the following external
contributions:

- [src/app/external/user-idle.service.ts](src/app/external/user-idle.service.ts) - MIT
  licence from GitHub repository
  [rednez/angular-user-idle](https://github.com/rednez/angular-user-idle)

# Requirements

This codebase is built on Angular 14, so the following are required:

- NodeJS (minimum 16.10.0)
- NPM (minimum 7.24.0)
- [Angular CLI](https://github.com/angular/angular-cli)

Also, you will need a Mauro backend instance running to communicate data between the
server and this web application. Please use
[mdm-application-build](https://github.com/MauroDataMapper/mdm-application-build) as a
development backend.

# Setup and Configuration

Please read the [setup guide](docs/SETUP.md) to correctly configure your Mauro instance to
use the Mauro Data Explorer.

# Installation

```bash
# Clone repo
git clone https://github.com/MauroDataMapper/mdm-explorer.git

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
# Build the project artefacts for distribution. Will output to dist/mdm-explorer
npm run dist

# Run linting on the code
npm run eslint

# Check all license headers are present in source files
npm run license-check check

# Add missing license headers
npm run license-check add

# Useful command that encapsulates license header checks, linting and testing in one go. Helpful when preparing for submitting pull requests
npm run pr-checks
```

# Running tests

The `npm run test` and `npm run test:watch` commands will run the test suite via the terminal.

If using VS Code, there are extensions available to integrate a test explorer and run/debug individual tests. If using one of those, you will need to uncomment this line in `src/setupJest.js`:

```js
import 'jest-preset-angular/setup-jest';
```

By default this is commented _out_ because `@angular-builders/jest` already does this - `npm run test` is an alias for `ng test`, which calls the Angular builder. However, running VS Code extensions do not run tests this way, meaning setup is required. If using an extension as a test explorer, remember to _comment out_ this line again before submitting a PR.

# Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use
`ng generate directive|pipe|service|class|guard|interface|enum|module`.

# mdm-resources

We have a dependency on another repository
([mdm-resources](https://github.com/MauroDataMapper/mdm-resources)) which we develop.

The `package.json` file is configured to use the latest release of this module into the
NPM registry, however if you are developing `mdm-resources` alongside this repo or you
know there are changes which have not yet been released you will need to do the following:

1. Clone the `mdm-resources` repository
2. Link the `mdm-resources` repository into your global npm
3. Link `mdm-resources` into `mdm-explorer`

Once you have linked the `mdm-resources` repo into the global npm it will remain there
until you unlink it, you will have to re-build (`npm run build`) `mdm-resources` with each
change for those changes to be picked up by `mdm-explorer`, however you don't have
to re-link after the rebuild.

## Linking to mdm-resources

If you run `npm install` inside this repo you will have to re-run the final link step
below to re-link mdm-resources into mdm-explorer.

```bash
# Clone mdm-resources
git clone git@github.com:MauroDataMapper/mdm-resources.git

# Link mdm-resources to global npm
cd mdm-resources
npm install
npm run build
npm link

# Link mdm-resources into mdm-explorer
cd mdm-explorer
npm link @maurodatamapper/mdm-resources
```

## Unlinking from mdm-resources

Simply run `npm install` or `npm ci` to remove previous links.

## Useful Tool for Links

There is a useful npm package ([symlinked](https://www.npmjs.com/package/symlinked)) which
can list what modules are linked into your repository. This is helpful if you want to
check if `mdm-resources` is currently linked to `mdm-explorer`.

We recommend installing this globally with `npm install -g symlinked` then you can call it
inside `mdm-explorer` using `symlinked names`.

## Using enviroment variables to set an alternate api root
The enviroment service will take a set enviroment key and expose a class with an api root value that is then consumed in build. This allows you to set a value in your enviroment (terminal or container) to use in production builds. There is a possiblity of expanding this for other options.

Current enviroment keys:
`MDM_EXPLORER_API_ENDPOINT` - the api web root

Example setup for a unix terminal:

Set the api root in the enviroment
`expose MDM_EXPLORER_API_ENDPOINT="MyTestEndpoint`

create a distribution with the custom api set 
`npm run dist`

OPTIONAL - you can check `root/dist/yourSnapshotName/main.*` and note mauroCoreEndpoint to see if it took

deploy your distribution to a httpserver
install the httpserver `npm install --global http-server`
run the dist  `http-server dist/yourSnapshotName`



