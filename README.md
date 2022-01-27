# Alien Worlds API

### API to index and read Alien Worlds data

[![Visual Source](https://img.shields.io/badge/visual-source-orange)](https://www.visualsource.net/repo/github.com/alien-Worlds/alienworlds-api)

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
3. Edit local configuration (consult with an engineer from the team if needed)
   - Edit `config.js`
   - Copy `.env.example` to `.env` & configure as needed.
4. Build all docker images, download all dependencies + initialize database
   ```bash
   docker compose build
   docker compose run api yarn
   docker compose run api yarn build
   docker compose run api yarn abis
   docker compose run api yarn mongo-indexes
   docker compose run api yarn husky
   ```
   _Hint: each command is individually documented below the "Commands List" section._
5. Start all services -> the API will be accessible at `localhost:8080`
   ```bash
   docker compose up
   ```

# Commands List

## Running

_Editing files in `src` folder will automatically recompile & reload changes is running services._

`docker compose up`

## Manual Procedures

### Rebuild All Docker Containers Locally

This command will build all docker containers (each service runs in a separated container) locally.
_Hint: Advanced use: [Use docker CLI to log in](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) to `ghcr.io` to access remote cached versions of the containers for faster startup. This is optional for local development - used by the CI._

`docker compose build`

## Download all Node Dependencies

This must be run every time when `package.json` changes. It will download all node dependencies into the `node_modules` folder.

`docker compose run api yarn`

## Build All Alien World Services

Specific build command to initialize Alien World related configurations.

`docker compose run api yarn build`

#### Fetch ABIs

This must be redone when the ABI changes.

`docker compose run api yarn abis`

#### Setup Mongo Indexes

Only need to be run once, to set up the indexes in MongoDB.

`docker compose run api yarn mongo-indexes`

## Maintenance

### Install Git Pre-commit Hooks

Husky is a utility to automatically set up Git Hooks for local development.

`docker compose run api yarn husky`

### Style check

We're using ESLint & Prettier for sanity & style check. The following command win run both at once.
Once Husky is initialized, these checks will run automatically before every commit & push.

`docker compose run api yarn lint`

### Style auto fix

The following command will attempt to fix all lint & style issues automatically.

`docker compose run api yarn lint-fix`

### Shell

The following command will let you log in inside the API container. The container contains an alpine linux with the exact required node & npm installations. Logging into the container can help debugging and you can also use all the tools required to run the app right inside the container, without even installing it on your own host machine.
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

# API Access

- In local development mode the API is accessible at http://localhost:8900
- Production API documentation is available at https://alien-worlds.github.io/alienworlds-api
- For extending / updating our API documentation, please look into the official [fastify-oas](https://github.com/SkeLLLa/fastify-oas) documentation.
