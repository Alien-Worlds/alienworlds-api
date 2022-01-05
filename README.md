# Alien Worlds API

API to index and read Alien Worlds data

## Requirements

- Docker

## Configuring

Please edit `./src/config/config.ts`

# Running

```
docker compose up

// or with a custom NODE_ENV

NODE_ENV=your_environment docker compose up
```

# Manual Procedures

## Full rebuild

```
docker compose build

// or with a custom NODE_ENV that was used during build

NODE_ENV=your_environment docker compose build
```

### Fetch ABIs

This must be redone when the ABI changes

`docker compose run api yarn abis`

### Setup Mongo Indexes

`docker compose run api yarn mongo-indexes`

### Run API tests

`docker compose -f docker-compose-api-tests.yml up`
