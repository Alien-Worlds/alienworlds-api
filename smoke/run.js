// Seeds MongoDB, calls the API, and records or checks the responses.
//   MODE=record  write smoke/golden/cases.json
//   MODE=check   compare against it; exit 1 on any difference (default)
const fs = require('fs');
const { execFileSync } = require('child_process');
const seed = require('./seed');
const amqp = require('/var/www/api/node_modules/amqplib');
const { MongoClient } = require('/var/www/api/node_modules/mongodb');

const BASE = 'http://api:8800';
const P = '/v1/alienworlds';
const GOLDEN = '/smoke/golden/cases.json';
const MODE = process.env.MODE || 'check';

const cases = [
  ['mines default', 'GET', `${P}/mines`],
  ['mines limit', 'GET', `${P}/mines?limit=2`],
  ['mines sort asc', 'GET', `${P}/mines?sort=asc&limit=3`],
  ['mines miner', 'GET', `${P}/mines?miner=miner1.wam`],
  ['mines landowner multi', 'GET', `${P}/mines?landowner=owner1.wam,owner2.wam`],
  ['mines land_id multi', 'GET', `${P}/mines?land_id=1099511627780,1099511627781`],
  ['mines planet', 'GET', `${P}/mines?planet_name=kavian.world`],
  ['mines date range', 'GET', `${P}/mines?from=2022-01-02&to=2022-01-05`],
  ['mines global_sequence range', 'GET', `${P}/mines?global_sequence_from=1001&global_sequence_to=1004`],
  ['mines tx_id', 'GET', `${P}/mines?tx_id=${'tx2'.padEnd(64, '0')}`],
  ['mines limit too large', 'GET', `${P}/mines?limit=6000`],
  ['mines bad sort', 'GET', `${P}/mines?sort=sideways`],
  ['mines limit not a number', 'GET', `${P}/mines?limit=abc`],
  ['mines trailing slash', 'GET', `${P}/mines/`],
  ['nfts default', 'GET', `${P}/nfts`],
  ['nfts rarity', 'GET', `${P}/nfts?rarity=Rare`],
  ['nfts template', 'GET', `${P}/nfts?template_id=1001`],
  ['nfts miner sort asc', 'GET', `${P}/nfts?miner=miner1.wam&sort=asc`],
  ['mineluck default', 'GET', `${P}/mineluck`],
  ['mineluck date range', 'GET', `${P}/mineluck?from=2022-01-01&to=2022-01-04`],
  ['asset by id', 'GET', `${P}/asset?id=1099511627776`],
  ['asset by ids', 'GET', `${P}/asset?id=1099511627776,1099511627778`],
  ['asset not found', 'GET', `${P}/asset?id=999`],
  ['asset by owner', 'GET', `${P}/asset?owner=miner1.wam`],
  ['asset by owner and schema', 'GET', `${P}/asset?owner=miner1.wam&schema=tool.worlds&limit=1&offset=1`],
  ['token supply', 'GET', `${P}/token?type=supply`],
  ['token circulating', 'GET', `${P}/token?type=circulating`],
  ['token bad type', 'GET', `${P}/token?type=nope`],
  ['openapi document', 'GET', `${P}/docs/json`],
  ['openapi yaml', 'GET', `${P}/docs/yaml`],
  ['docs ui entry', 'GET', `${P}/docs`],
  ['docs ui page', 'GET', `${P}/docs/static/index.html`],
  ['docs ui asset', 'GET', `${P}/docs/static/swagger-ui-bundle.js`],
  ['docs static path traversal', 'GET', `${P}/docs/static/..%2f..%2fpackage.json`],
  ['unknown route', 'GET', `${P}/nothing-here`],
  ['cors preflight', 'OPTIONS', `${P}/mines`, { Origin: 'https://example.test', 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'Content-Type' }],
  ['cors simple request', 'GET', `${P}/mines?limit=1`, { Origin: 'https://example.test' }],
];

const KEEP_HEADERS = ['content-type', 'access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers'];

const wait = ms => new Promise(r => setTimeout(r, ms));
async function waitForApi() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`${BASE}${P}/docs/json`)).status === 200) return; } catch (e) { /* not up yet */ }
    await wait(1000);
  }
  throw new Error('API did not become ready in 60s');
}

const stable = v =>
  Array.isArray(v) ? v.map(stable)
  : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, stable(v[k])]))
  : v;

// /mineluck groups with no $sort, and $addToSet arrays have no defined order,
// so MongoDB may return them in any order. Order them here so the comparison
// tests the content, not the luck of the draw.
const orderMineluck = body => {
  if (!body || !Array.isArray(body.results)) return body;
  const sortArr = a => (Array.isArray(a) ? [...a].sort((x, y) => String(x).localeCompare(String(y))) : a);
  const results = body.results.map(r => ({ ...r, planets: sortArr(r.planets), rarities: sortArr(r.rarities), tools: sortArr(r.tools) }));
  results.sort((a, b) => String(a.miner).localeCompare(String(b.miner)));
  return { ...body, results };
};

async function call([name, method, path, headers]) {
  const res = await fetch(BASE + path, { method, headers });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch (e) { body = text; }
  if (path.startsWith(`${P}/mineluck`)) body = orderMineluck(body);
  body = stable(body);
  const h = {};
  for (const k of KEEP_HEADERS) if (res.headers.get(k) !== null) h[k] = res.headers.get(k);
  return { name, request: `${method} ${path}`, status: res.status, headers: h, body };
}

// Runs the real index setup script (dist/mongo_setup.js, via the repo's own
// connectMongo) against the seeded database, then lists the indexes it made.
// This is the only check that exercises the connection code used by processor,
// filler and blockrange.
async function indexSetupCase() {
  execFileSync('node', ['dist/mongo_setup.js'], { cwd: '/var/www/api', stdio: 'pipe' });
  const client = await MongoClient.connect('mongodb://mongo:27017', { useUnifiedTopology: true });
  const db = client.db('smoke');
  const body = {};
  for (const c of ['mines', 'nfts', 'assets', 'atomictransfers']) {
    const idx = await db.collection(c).indexes();
    body[c] = idx.map(i => ({ name: i.name, key: i.key })).sort((a, b) => a.name.localeCompare(b.name));
  }
  await client.close();
  return { name: 'mongo_setup indexes', request: 'node dist/mongo_setup.js', status: 0, headers: {}, body: stable(body) };
}

// Runs the real dist/fetch_abis.js against the mock chain. It makes one request per
// contract in sequence, which is what fails with "socket hang up" when keep-alive
// is left on. Records the exit status and the files it wrote.
async function fetchAbisCase() {
  const dir = fs.mkdtempSync('/tmp/abis-');
  let status = 0;
  try {
    execFileSync('node', ['dist/fetch_abis.js', dir], { cwd: '/var/www/api', stdio: 'pipe' });
  } catch (e) {
    status = e.status || 1;
  }
  const files = fs.readdirSync(dir).sort().map(f => `${f}: ${fs.readFileSync(`${dir}/${f}`, 'utf8')}`);
  return { name: 'fetch_abis', request: 'node dist/fetch_abis.js', status, headers: {}, body: stable({ files }) };
}


// The processor (RabbitMQ consumer, cluster master and workers). A worker that crashed used to
// disappear for good: the processor stayed up and logged nothing new while it had no consumers
// left, so queues filled and nothing was processed. Checks that its consumers survive a
// malformed message, that a killed worker is replaced, and that it subscribes again after RabbitMQ
// cancels its consumers.
async function processorCase() {
  const WORKERS = 2; // processor_threads in config.smoke.js
  const EXPECTED = WORKERS * 30; // the processor opens 30 consumers on 'action' per worker
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const retry = async (fn, seconds, what) => {
    const until = Date.now() + seconds * 1000;
    for (;;) {
      try { return await fn(); } catch (e) {
        if (Date.now() > until) throw new Error(`${what}: ${e.message}`);
        await sleep(1000);
      }
    }
  };
  const conn = await retry(() => amqp.connect('amqp://aw:aw@rabbitmq'), 120, 'connecting to RabbitMQ');
  const consumers = async () => {
    const ch = await conn.createChannel();
    ch.on('error', () => {}); // checkQueue on a queue that does not exist yet closes the channel
    try { return (await ch.checkQueue('action')).consumerCount; } catch (e) { return -1; } finally { await ch.close().catch(() => {}); }
  };
  const waitFor = async (pred, seconds, what) => {
    const until = Date.now() + seconds * 1000;
    let last;
    while (Date.now() < until) { last = await consumers(); if (pred(last)) return last; await sleep(250); }
    throw new Error(`timed out waiting for ${what} (last consumer count: ${last})`);
  };

  const ready = await waitFor(n => n === EXPECTED, 240, `${EXPECTED} consumers on the action queue`);

  // A message the processor cannot decode (shorter than its fixed header). The handler used to
  // throw outside any try/catch, which killed the worker.
  const ch = await conn.createChannel();
  await ch.assertQueue('action', { durable: true });
  ch.sendToQueue('action', Buffer.from([1, 2, 3]));
  await ch.close();
  await sleep(10000);
  const afterMalformed = await consumers();

  // Kill one worker and wait for the master to replace it.
  fs.writeFileSync('/flag/kill', '1');
  const dropped = await waitFor(n => n < EXPECTED, 60, 'the killed worker to disappear');
  const recovered = await waitFor(n => n === EXPECTED, 120, 'the killed worker to be replaced');

  // Deleting the queue makes RabbitMQ cancel every consumer on it while the connections stay
  // open. Nothing used to notice, so the workers stayed up with no consumers. Now they exit, the
  // master restarts them, and they declare the queue again and subscribe.
  const ch2 = await conn.createChannel();
  await ch2.deleteQueue('action');
  await ch2.close();
  const queueGone = await waitFor(n => n === -1, 30, 'the deleted queue to disappear');
  const resubscribed = await waitFor(n => n === EXPECTED, 180, 'the workers to subscribe again after the queue was deleted');
  await conn.close();

  return {
    name: 'processor survives a malformed message, a killed worker and cancelled consumers',
    request: 'node dist/processor.js (RabbitMQ queue action)',
    status: 0,
    headers: {},
    body: stable({
      consumers_when_ready: ready,
      consumers_after_malformed_message: afterMalformed,
      worker_loss_seen: dropped < EXPECTED,
      consumers_after_worker_restart: recovered,
      consumers_cancelled_by_queue_deletion: queueGone === -1,
      consumers_after_cancellation: resubscribed,
    }),
  };
}

(async () => {
  await seed('mongodb://mongo:27017', 'smoke');
  await waitForApi();
  const results = [];
  for (const c of cases) results.push(await call(c));
  results.push(await indexSetupCase());
  results.push(await fetchAbisCase());
  results.push(await processorCase());

  if (MODE === 'record') {
    fs.writeFileSync(GOLDEN, JSON.stringify(results, null, 2) + '\n');
    console.log(`recorded ${results.length} cases to smoke/golden/cases.json`);
    return;
  }
  const golden = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
  let bad = 0;
  for (const r of results) {
    const g = golden.find(x => x.name === r.name);
    const same = g && JSON.stringify(stable(g)) === JSON.stringify(stable(r));
    if (!same) {
      bad++;
      console.log(`DIFF  ${r.name}  (${r.request})`);
      console.log(`  expected status ${g ? g.status : '(none recorded)'}, got ${r.status}`);
      if (g && JSON.stringify(g.body) !== JSON.stringify(r.body)) {
        console.log('  expected body:', JSON.stringify(g.body).slice(0, 300));
        console.log('  got body:     ', JSON.stringify(r.body).slice(0, 300));
      }
      if (g && JSON.stringify(g.headers) !== JSON.stringify(r.headers)) {
        console.log('  expected headers:', JSON.stringify(g.headers));
        console.log('  got headers:     ', JSON.stringify(r.headers));
      }
    }
  }
  for (const g of golden) if (!results.find(r => r.name === g.name)) { bad++; console.log(`MISSING  ${g.name}`); }
  console.log(`${results.length - bad}/${results.length} cases match`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
