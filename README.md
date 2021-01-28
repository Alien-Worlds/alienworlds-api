# Alien Worlds API

API to index and read Alien Worlds data

## Building

`yarn`
`yarn build`

## Configuring

`cp config.example.js dist/config.js`

Edit the config file as necessary

Run directly or use pm2

### Fetch ABIs

It is necessary to do a one-time fetch of the contract ABIs (this must be redone if the ABI changes)

`node ./fetch_abis.js`

### Setup Mongo Indexes

`node ./mongo_setup.js`

## Running

Run the filler first

`node ./filler.js`

Then the processor

`node ./processor.js`
