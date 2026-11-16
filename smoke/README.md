# API smoke harness

Black-box check of the `api` process. It records what the API returns for a fixed
set of requests against fixed data, then compares later runs with that recording.
It exists so dependency and framework upgrades (fastify, mongodb, ethers) can show
"the responses did not change" instead of hoping.

`master` has no unit tests; this is the safety net until it does.

## Run it

Needs Docker. From the repo root:

```sh
smoke/run.sh          # check: compare with smoke/golden/cases.json (exit 1 on any difference)
smoke/run.sh record   # re-record the golden file (do this only on purpose, see below)
```

## What it does

1. Builds an image like the repo Dockerfile (frozen lockfile, `--ignore-scripts`),
   except it skips `yarn abis`, which downloads ABIs from a live public API.
2. Starts MongoDB 5.0 (pinned by digest), a mock chain endpoint and the `api` on an
   internal Docker network with no route to the internet.
3. Seeds fixed documents (`smoke/seed.js`), calls 32 requests (`smoke/run.js`) and
   compares status, selected headers (content-type, CORS) and the JSON body.

Covered: `/mines`, `/nfts`, `/mineluck`, `/asset` and `/token` with their filters, the
error paths (limit too large, bad sort, non-integer limit, not found), the OpenAPI
document, CORS, a trailing slash and an unknown route.

## Updating the recording

The golden file is a record of current behaviour, including behaviour that may be
wrong. A difference after a change means "the output changed", not "it broke".
Review each one. Re-record only when the change is intended, and put the golden diff
in the same pull request so a reviewer sees what moved.

## Known limits

- Only the `api` process. `processor`, `filler` and `blockrange` need a SHiP node
  and RabbitMQ; an `amqplib` upgrade needs its own check.
- Load-time checks only for New Relic (agent disabled).
- `/mineluck` groups without a sort, so the harness orders its results and arrays
  before comparing, and the seed keeps each miner's bag identical (otherwise `tools`
  depends on `$addToSet` order). Both are existing quirks of that route.
- MongoDB 5.0 is end-of-life. It is the newest server line the 3.6 driver supports.
  Replace it when the driver is upgraded.
- The mock chain returns fixed numbers, so `/token` checks the arithmetic and
  plumbing, not the real chain.
