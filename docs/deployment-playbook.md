# Deployment playbook: Node 24 and dependency upgrade release

This playbook covers deploying the release that contains PRs #79 to #84:

| PR | Change |
|---|---|
| #79 | Node 17 to Node 24 LTS, a synced lockfile, CI |
| #80 | Same-major dependency fixes for the critical audit advisories |
| #81 | API smoke harness (`smoke/`) |
| #82 | `mongodb` driver 3.6 to 4.17.2, smoke harness on MongoDB 6.0 |
| #83 | New Relic agent 8.17.1 to 13.20.0 |
| #84 | Fastify 3 to 5 and its plugins |

Production dependency audit (`yarn audit --groups dependencies`) after the release: 0 critical, 0 high (21 moderate, 10 low). Before: 12 critical, 29 high.

GitHub's Dependabot page for `master` shows a larger number (65 open alerts when this was written: 11 critical, 19 high, 22 medium, 8 low). Its runtime-scope alerts are 5 medium only; **all 11 critical and 19 high are in development dependencies** (lint and test tooling such as eslint and jest), which are not part of the production audit above. The Docker image no longer contains them: the `Dockerfile` has a `build` stage with every dependency and a default `production` stage with production dependencies and the compiled `dist` only (about 160 MB of `node_modules` instead of about 400 MB).

The goal of this document is to deploy without breaking anything and without harming the existing MongoDB. It lists what was verified, what was not, and the order to roll out in.

## 1. What this release changes, and what it does not

**Runtime and dependencies**

| Area | Before | After |
|---|---|---|
| Node.js | 17 | 24 (`engines.node >= 24.22.1`, image `node:24-alpine`) |
| `mongodb` driver | 3.6 | 4.17.2 |
| `fastify` | 3.25 | 5.12 (plugins replaced, see section 6) |
| New Relic agent | 8.17 | 13.20 |
| Outgoing HTTP | keep-alive off (Node 17 default) | keep-alive off, set explicitly at start-up (`src/include/disable-keepalive.ts`), because Node 19+ turns it on |
| Dependency installs | `yarn` with scripts | `yarn install --frozen-lockfile --ignore-scripts --ignore-optional` |

**MongoDB**

- There are **no data or schema changes**: no migration, no index change, and the BSON written is the same (`Long` values are handled identically). Rolling back is therefore clean.
- Writes are **idempotent**. A unique index on `global_sequence` rejects duplicates, and the processor acks them (error code 11000). A re-delivered batch cannot duplicate data. This is the main safety net.
- Only `processor` writes real data. `api` is read-only, `filler` and `blockrange` read, and `update_all_assets` is a manual script that writes.
- Driver 4.8 to 4.17 is fully supported on MongoDB 6.0 (see the compatibility table in section 8). Production runs MongoDB 6.

## 2. Evidence already collected

These were verified before the release was merged:

- The smoke harness (`smoke/run.sh check`, 38 cases against MongoDB 6.0.28) passes, with the New Relic agent off and on. It covers every API route, the error paths, CORS, the OpenAPI document, the docs UI and the index setup script.
- **Duplicate-key handling in `processor` works on driver 4.17.2.** `processor.ts` (the `insertMany(documents, { ordered: false }, cb)` callback and the `insertOne` catch) relies on the error shape of the old driver. It was tested against a throwaway MongoDB 6.0.28 with a unique index (see Appendix A): the `MongoBulkWriteError` still exposes `err.result.result.writeErrors[i].err.index` and `.err.code === 11000`, the non-duplicate documents are still inserted, and `insertOne` duplicates still have `e.code === 11000`.
- New Relic agent 13.20.0 starts on Node 24 and instruments `fastify` 5.12.8 and `mongodb` 4.17.2 (checked from the agent's trace log, offline).
- Supply chain: every lockfile entry comes from the npm registry with an integrity hash, no install scripts run, and OSV reported no malware advisories. Installed packages were at least 14 days old when each PR was written (a few reached 14 days on the day they merged). Optional packages that are not installed (the AWS SDK credential providers, `@datadog/pprof`, `@newrelic/native-metrics`) are listed in `yarn.lock`, some of them younger than 14 days, but are never fetched because installs use `--ignore-optional`.

## 3. What has not been verified

- **`processor`, `filler` and `blockrange` real work end to end.** They need a SHiP node and RabbitMQ. The harness covers their shared MongoDB connection and index setup only.
- **RabbitMQ connection.** `url-parse` was pinned from 1.4 to 1.5.10 so `amqplib` 0.6 could clear a critical advisory. `amqplib` uses it to parse the `amqp://` connection string, including credentials. Not exercised by any test.
- **New Relic reporting** into an account: route names, MongoDB spans, and whether the bundled security agent is off by default. Nothing was sent from the test network.
- **The production connection string** under driver 4 (see section 4), authentication method and CPU architecture.
- Real traffic. `master` has no unit tests.
- The real `Dockerfile` build was failing at `yarn abis` with `FetchError: ... socket hang up`. That was not an outage: since Node 19 the default HTTP agent keeps connections alive, and `node-fetch` 2 reuses sockets the server has closed. The same thing can hit `node-fetch` and `ethers` calls at runtime (`/token`, `processor`, `filler`). It is fixed by `src/include/disable-keepalive.ts`, which restores the Node 17 behaviour; deploy a build that contains it. The smoke harness now fails without that fix (its mock chain refuses socket reuse).

## 4. Pre-flight checklist

Do these before the first production change.

1. **Back up MongoDB** (snapshot or `mongodump`) and confirm you can restore it. Nothing in this release should need it.
2. **Record baselines**: document counts per collection (`mines`, `nfts`, `assets`, `atomictransfers`), the latest `global_sequence` in `mines` and `nfts`, RabbitMQ queue depth, API error rate and latency, MongoDB `connections` and `opcounters`, and your New Relic dashboards and alert rules.
3. **Dry-run the production connection string against driver 4, without connecting.** Driver 4 rejects removed or invalid URI options that 3.6 ignored. In the new image:
   ```sh
   node -e "const {MongoClient}=require('mongodb');const c=new MongoClient(require('./dist/config').mongo.url);console.log('parsed OK')"
   ```
   If this throws `MongoParseError`, fix the URI options first. The command does not print the URL.
4. **Check the MongoDB password.** `saslprep` is not installed (optional dependencies are skipped). An ASCII password behaves the same; a non-ASCII password may fail SCRAM authentication.
5. **Check `FILLER_FLAGS`** in production (for example `-r -s <start block> -c`). A restart with replay flags would refill from the start block. Leave the flags exactly as they are.
6. **Build the image once, in CI or staging, and deploy that image.** Do not build on the production host. Keep the previous image tag, or the previous pm2 release directory, for rollback.
7. **Runtime**: the host or image needs Node 24.22.1 or later. The image's default `production` stage has no dev tooling, so containers must run the compiled code (`node dist/api.js` and so on). The `yarn api` / `yarn processor` scripts use `tsc-watch`, a dev dependency, and only work in the `build` stage (`docker build --target build .`) or with a bind mount of an installed checkout. With pm2 on a host, install Node 24, then `yarn install --frozen-lockfile --ignore-scripts --ignore-optional` and `yarn build`. The `@eosrio/node-abieos` prebuilt binary is x86-64 glibc; it loaded on Alpine amd64. It has not been tried on arm64.
8. **Do not run `yarn mongo-indexes`** as part of the deploy. The indexes already exist; the dev `docker-compose.override.yml` runs it at API start, which production should not.

## 5. Staging rehearsal (recommended)

Two risks are not covered by any automated test and both involve `processor` and `filler`:

1. Run `processor` and `filler` against a staging RabbitMQ using a realistic URL, including a password with special characters.
2. Run `processor` against a real chain feed for a while, writing to a staging MongoDB restored from a backup. Compare new documents with production for the same block range.

## 6. Rollout order

Deploy one process at a time, and stop at the first sign of trouble.

1. **`api` first.** It is read-only, so it cannot corrupt data. Run one new instance next to the old one and compare responses. Watch the error rate, latency and MongoDB `connections`. Confirm New Relic shows Fastify routes and MongoDB spans.
2. **`processor` second** (the only real writer).
   - Stop the old processor gracefully. Messages queue in RabbitMQ; unacked ones are re-delivered.
   - Start the new one.
   - Watch for: `global_sequence` advancing, the queue draining, the insert rate matching the baseline, duplicate counts that look normal, and no `TypeError` or crash-loop restarts in the logs.
3. **`filler`**, once the processor is healthy, then **`blockrange`**.
4. **Observe for about 24 hours** before calling the release done.

With Docker Compose, use the same order: `docker compose pull`, then `docker compose up -d <service>` one service at a time.

### Changes API consumers will notice

- Validation errors (HTTP 400) now read `querystring/limit must be integer` (it was `querystring.limit should be integer`) and carry a `"code": "FST_ERR_VALIDATION"` field. A client that matches on the message text would break.
- The OpenAPI document (`/v1/alienworlds/docs/json`) is still OpenAPI 3.0.0 at the same path, but the `*` catch-all path is gone, query parameters gain `required: false`, and `components` gains an empty `schemas` object.
- The docs UI is Swagger UI 6 with assets under `/v1/alienworlds/docs/static/`.
- Everything else (`/mines`, `/nfts`, `/mineluck`, `/asset`, `/token` responses and error paths, CORS, 404 and 500 shapes) is identical.

### Changes to monitoring

- New Relic agent 13 stores route parameters as `request.parameters.route.*` attributes and may name Fastify and MongoDB metrics differently from agent 8. Dashboards and alerts built on the old names should be checked.
- GC and event-loop metrics from `@newrelic/native-metrics` are not reported (the addon is not installed, as before this release).
- The agent bundles `@newrelic/security-agent`. Confirm in your agent settings that it is not enabled unless you intend it.

## 7. Stop signs and rollback

**Roll back the process you just changed** if you see any of: crash-loop restarts, a growing RabbitMQ queue, `global_sequence` not advancing, a sudden jump in MongoDB connections or error logs, an API 5xx rate above baseline, or New Relic showing no transactions.

**Rollback**: revert one process at a time to the previous image tag or pm2 release. There is no data migration to undo. Keep the Node 17 runtime or the old image available until the new release has been stable for a few days.

## 8. MongoDB driver and server compatibility

From the MongoDB Node.js driver documentation (the 3.x and 4.x rows are from the archived docs for those versions). A tick means fully supported. `~` means it works but some newer server features are unsupported. A blank means not supported.

| Node driver | 8.0 | 7.0 | 6.0 | 5.0 | 4.4 | 4.2 | 4.0 | 3.6 | 3.4 and older |
|---|---|---|---|---|---|---|---|---|---|
| 3.6 (before this release) | | | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 4.8 to 4.17 (this release, 4.17.2) | | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| 5.0 to 5.6 | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| 5.7 to 5.9 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| 6.0 to 6.8 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| 6.9 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (deprecated) | |
| 6.10 to 6.16 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| 6.17 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | |

Driver 7.x was not in the documentation source consulted when this table was written. Check the current MongoDB docs before relying on it.

To check the server version: `db.version()` in `mongosh`.

## 9. Follow-up work, not part of this release

- Move the driver to 6.x. It removes callbacks and `cursor.count()`, so the callback in `processor.ts`, `connectMongo` and the `.count()` calls need to change, and `processor` needs its own test first.
- Upgrade TypeScript. Fastify 5 ships TypeScript 5 type declarations, so `src/api.ts` loads the Fastify packages with `require()` until then.
- Clearing the development-dependency Dependabot alerts at the source means upgrading or removing the dev tooling (eslint and its plugins, `redoc-cli`, `ts-jest`, `tsc-watch`). `redoc-cli` alone accounts for most of the critical and high alerts.
- The remaining moderate audit findings (`@opentelemetry/core` via `newrelic`, `bn.js` via `eosjs` and `ethers`, `glob` and `minimatch` via `@fastify/swagger-ui`).

## Appendix A: duplicate-key handling check

This reproduces the processor's error handling against a throwaway MongoDB with a unique index. Run it only against a disposable database, never production. It needs the repo's installed `node_modules` (driver 4.17.2) and a reachable throwaway MongoDB.

```js
// Mirrors the error handling in src/processor.ts: the insertMany ordered:false
// callback (line ~192) and the insertOne catch (line ~359).
const { MongoClient } = require('mongodb');
(async () => {
  console.log('driver', require('mongodb/package.json').version);
  const client = await MongoClient.connect('mongodb://localhost:27017');
  const col = client.db('duptest').collection('mines');
  await col.deleteMany({});
  await col.createIndex({ global_sequence: 1 }, { unique: true });
  await col.insertOne({ global_sequence: 1, n: 'a' });

  const docs = [{ global_sequence: 0, n: 'x' }, { global_sequence: 1, n: 'dup' }, { global_sequence: 2, n: 'y' }];
  await new Promise(resolve => {
    col.insertMany(docs, { ordered: false }, (err, res) => {
      const found = [];
      for (let i = 0; i < docs.length; i++) {
        // the exact expressions used in processor.ts
        const we = err.result.result.writeErrors.find(w => w.err.index === i);
        if (we) found.push({ index: i, code: we.err.code });
      }
      console.log('write errors found:', JSON.stringify(found)); // expect [{"index":1,"code":11000}]
      resolve();
    });
  });
  console.log('documents after:', await col.countDocuments({})); // expect 3
  try { await col.insertOne({ global_sequence: 1, n: 'dup2' }); }
  catch (e) { console.log('insertOne duplicate code:', e.code); } // expect 11000
  await client.db('duptest').dropDatabase();
  await client.close();
})();
```

Expected output on driver 4.17.2 with MongoDB 6.0: `write errors found: [{"index":1,"code":11000}]`, `documents after: 3`, `insertOne duplicate code: 11000`.
