# Alien Worlds API

### API to index and read Alien Worlds data

# First Time Installation & Configuration

### Please read & follow the steps before first installation

### Installation Steps

1. Install Docker if you haven't done so
   `brew install docker` or [download it from the official docker website](https://www.docker.com/products/docker-desktop).
2. Fork the repository on Github, and clone it locally
   ```bash
   git clone <your-git-account>/alienworlds-api.git
   cd alienworlds-api
   ```
3. Edit local configuration (consult with an engineer if necessary)
   - Edit `config.js`
   - Copy `.env.example` to `.env` & configure as needed.
4. Build all docker images & download all dependencies + initialize DBs
   ```bash
   docker compose build
   docker compose run api yarn
   docker compose run api yarn build
   docker compose run api yarn abis
   docker compose run api yarn mongo-indexes
   docker compose run api yarn husky
   ```
   _Hint: each command is individually documented below the "Commands List" section._
5. Start the API
   ```bash
   docker compose up
   ```

# Commands List

## Running

_Editing files in `src` folder will automatically recompile & reload changes is running services._

`docker compose up`

## Manual Procedures

### Rebuild All Docker Containers Locally

This command will build all the required dockent containers for all service locally.
_Hint: If you can login to the docker repository, it will attempt to download pre-compiled images as a cache mechanism (CI is using it, not require for local development.)_

`docker compose build`

## Download all Node Dependencies

This must be run every time when `package.json` changes.

`docker compose run api yarn`

## Build All Alien World Services

`docker compose run api yarn build`

#### Fetch ABIs

This must be redone when the ABI changes

`docker compose run api yarn abis`

#### Setup Mongo Indexes

`docker compose run api yarn mongo-indexes`

## Maintenance

### Install Git Pre-commit Hooks

`docker compose run api yarn husky`

### Style check

`docker compose run api yarn lint`

### Style auto fix

_Use with caution - not all style errors can be fixed._

`docker compose run api yarn lint-fix`

### Shell

_Please always use `yarn` instead of `npm` to maintain `yarn.lock` file integrity._

`docker compose run api sh`

### Uploading Compiled docker images to Docker registry

This command will upload all docker containers to the given registry.
The registry is defined in the `.env` file, by default it's Github's Container registry: `DOCKER_REGISTRY=ghcr.io/alien-worlds`
This command is normally part of the CI process. To make it work you must log in to the docker registry first.
More information about how to login to Github's Docker registry with docker using the CLI and a Personal Access Token, [please read the official documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

`docker compose push`

### Pulling the latest compiled images from Docker repository

This command is part of the CI chain and normally don't need to run locally.
Requires a successful docker login to the registry first ([please read the official documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)), then you can pull the images (instead of building locally).

`docker compose pull`
