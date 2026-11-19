// Run with: yarn test:unit (compiles to dist first, then node --test).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const EventEmitter = require('node:events');
const { WorkerSupervisor } = require('../dist/include/worker-supervisor');

function fakeCluster() {
  const cluster = new EventEmitter();
  cluster.nextId = 1;
  cluster.workers = [];
  cluster.fork = () => {
    const worker = new EventEmitter();
    worker.id = cluster.nextId++;
    worker.process = { pid: 1000 + worker.id };
    cluster.workers.push(worker);
    return worker;
  };
  return cluster;
}

function setup(options = {}) {
  const timers = [];
  const logs = { warn: [], error: [] };
  let clock = 0;
  const cluster = fakeCluster();
  const supervisor = new WorkerSupervisor(cluster, {
    log: {
      warn: (...a) => logs.warn.push(a.join(' ')),
      error: (...a) => logs.error.push(a.join(' ')),
    },
    setTimeoutFn: (fn, ms) => timers.push({ fn, ms }),
    now: () => clock,
    ...options,
  });
  supervisor.start();
  return {
    cluster,
    supervisor,
    timers,
    logs,
    advance: ms => (clock += ms),
    // exit the newest worker, then fire the restart timer that was scheduled
    crashAndRestart(worker, code = 1) {
      cluster.emit('exit', worker, code, null);
      const timer = timers[timers.length - 1];
      timer.fn();
      return timer.ms;
    },
  };
}

test('a worker that exits is replaced, with the same role and message handler', () => {
  const t = setup();
  const seen = [];
  const first = t.supervisor.spawn('processor', (worker, msg) => seen.push([worker.id, msg]));
  assert.equal(t.cluster.workers.length, 1);

  const delay = t.crashAndRestart(first, 1);
  assert.equal(delay, 1000);
  assert.equal(t.cluster.workers.length, 2);

  const second = t.cluster.workers[1];
  second.emit('message', { online: true });
  assert.deepEqual(seen, [[second.id, { online: true }]]);
});

test('the exit is logged with the role, pid, exit code and signal', () => {
  const t = setup();
  const worker = t.supervisor.spawn('recalc');
  t.cluster.emit('exit', worker, 1, 'SIGKILL');
  assert.equal(t.logs.error.length, 1);
  assert.match(t.logs.error[0], /recalc/);
  assert.match(t.logs.error[0], /pid 1001/);
  assert.match(t.logs.error[0], /code 1/);
  assert.match(t.logs.error[0], /SIGKILL/);
  assert.match(t.logs.error[0], /restarting in 1000ms/);
});

test('a crash loop backs off, up to a limit', () => {
  const t = setup({ maxDelayMs: 5000 });
  let worker = t.supervisor.spawn('processor');
  const delays = [];
  for (let i = 0; i < 5; i++) {
    delays.push(t.crashAndRestart(worker));
    worker = t.cluster.workers[t.cluster.workers.length - 1];
  }
  assert.deepEqual(delays, [1000, 2000, 4000, 5000, 5000]);
});

test('a worker that stayed up long enough resets the back-off', () => {
  const t = setup({ stableMs: 60000 });
  let worker = t.supervisor.spawn('processor');
  t.crashAndRestart(worker); // 1000
  worker = t.cluster.workers[1];
  assert.equal(t.crashAndRestart(worker), 2000);
  worker = t.cluster.workers[2];
  t.advance(61000); // the third worker runs for over a minute
  assert.equal(t.crashAndRestart(worker), 1000);
});

test('roles back off independently', () => {
  const t = setup();
  const recalc = t.supervisor.spawn('recalc');
  const processor = t.supervisor.spawn('processor');
  t.crashAndRestart(recalc);
  t.crashAndRestart(recalc === t.cluster.workers[0] ? t.cluster.workers[2] : recalc);
  // a first exit of the processor role is still the shortest delay
  assert.equal(t.crashAndRestart(processor), 1000);
});

test('a worker it did not spawn is ignored', () => {
  const t = setup();
  const stranger = t.cluster.fork();
  t.cluster.emit('exit', stranger, 1, null);
  assert.equal(t.timers.length, 0);
  assert.equal(t.logs.error.length, 0);
});

test('no restart after stop()', () => {
  const t = setup();
  const worker = t.supervisor.spawn('processor');
  t.supervisor.stop();
  t.cluster.emit('exit', worker, 0, 'SIGTERM');
  assert.equal(t.timers.length, 0);
  assert.equal(t.cluster.workers.length, 1);
  assert.match(t.logs.warn[0], /not restarting/);
});

test('a restart that was already scheduled is cancelled by stop()', () => {
  const t = setup();
  const worker = t.supervisor.spawn('processor');
  t.cluster.emit('exit', worker, 1, null);
  t.supervisor.stop();
  t.timers[0].fn();
  assert.equal(t.cluster.workers.length, 1);
});
