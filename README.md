# Alien Worlds API

### API to index and read Alien Worlds data

# First Time Installation & Configuration

### Please read & follow the steps before first installation

### Installation Steps

1. Install Docker if you haven't done so
   `brew install docker` or [download it from the official docker website](https://www.docker.com/products/docker-desktop). 
2. Fork the repository on git, and clone it locally
    ```bash
    git clone <your-git-account>/alienworlds-api.git
    cd alienworlds-api
    ```
3. Edit local configuration (consult with an engineer if necessary)
    * Edit `config.js`
    * Copy `.env.example` to `.env` & configure as needed.
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

### Rebuild Docker Images

`docker compose build`

## Rebuild Node Dependencies

`docker compose run api yarn`

## Build All Services

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
