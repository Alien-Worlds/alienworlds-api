# Alien Worlds API

API to index and read Alien Worlds data

## Requirements

- Docker

## Configuring

Please edit `config.js`

# Running

`docker compose up`

# Manual Procedures

## Full rebuild

`docker compose build`

### Fetch ABIs

This must be redone when the ABI changes

`docker compose run api yarn abis`

### Setup Mongo Indexes

`docker compose run api yarn mongo-indexes`
