# Alien Worlds API

API to index and read Alien Worlds data

## Requirements

- Docker

## Configuring

Please edit `./src/config/config.ts` along with `.env-{develop|test|production}`

# Running

`NODE_ENV=develop|test|production docker compose up`

# Manual Procedures

## Full rebuild

`NODE_ENV=develop|test|production docker compose build`

### Fetch ABIs

This must be redone when the ABI changes

`docker compose run api yarn abis`

### Setup Mongo Indexes

`docker compose run api yarn mongo-indexes`
