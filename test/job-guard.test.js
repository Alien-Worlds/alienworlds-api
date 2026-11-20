const { test } = require('node:test');
const assert = require('node:assert/strict');
const { guardJobHandler, exitOnConsumerCancel } = require('../dist/include/job-guard');
const { Amq } = require('../dist/connections/amq');

function setup(handler, options = {}) {
  const calls = { reject: [], sleep: [] };
  const logs = { warn: [], error: [] };
  const amq = { reject: async job => { calls.reject.push(job); } };
  const guarded = guardJobHandler('action', handler, amq, {
    retryDelayMs: 250,
    sleep: async ms => { calls.sleep.push(ms); },
    log: { warn: (...a) => logs.warn.push(a.join(' ')), error: (...a) => logs.error.push(a.join(' ')) },
    ...options,
  });
  return { guarded, calls, logs, amq };
}

test('a handler that succeeds is left alone', async () => {
  const handled = [];
  const t = setup(async job => { handled.push(job); });
  const job = { content: 1 };
  await t.guarded(job);
  assert.deepEqual(handled, [job]);
  assert.equal(t.calls.reject.length, 0);
  assert.equal(t.logs.error.length, 0);
});

test('a handler that throws is logged and the job is put back after a delay', async () => {
  const t = setup(async () => { throw new Error('Read past end of buffer'); });
  const job = { content: 1 };
  await t.guarded(job); // must not throw
  assert.equal(t.logs.error.length, 1);
  assert.match(t.logs.error[0], /Read past end of buffer/);
  assert.deepEqual(t.calls.sleep, [250]);
  assert.deepEqual(t.calls.reject, [job]);
});

test('a handler that throws synchronously is covered too', async () => {
  const t = setup(() => { throw new TypeError('boom'); });
  const job = {};
  await t.guarded(job);
  assert.deepEqual(t.calls.reject, [job]);
});

test('a job that was already settled is not rejected again', async () => {
  const t = setup(async job => { job.__settled = true; throw new Error('after the ack'); });
  const job = {};
  await t.guarded(job);
  assert.equal(t.logs.error.length, 1);
  assert.equal(t.calls.reject.length, 0);
});

test('a job settled during the retry delay is not rejected', async () => {
  const job = {};
  const t = setup(async () => { throw new Error('x'); }, {
    sleep: async () => { job.__settled = true; },
  });
  await t.guarded(job);
  assert.equal(t.calls.reject.length, 0);
});

test('a consumer cancellation (null job) is logged and ignored', async () => {
  let called = false;
  const t = setup(async () => { called = true; });
  await t.guarded(null);
  assert.equal(called, false);
  assert.match(t.logs.warn[0], /cancelled by the server/);
});

test('if returning the job fails, that is logged and nothing escapes', async () => {
  const logs = { error: [] };
  const amq = { reject: async () => { throw new Error('channel closed'); } };
  const guarded = guardJobHandler('action', async () => { throw new Error('first'); }, amq, {
    sleep: async () => {},
    log: { warn() {}, error: (...a) => logs.error.push(a.join(' ')) },
  });
  await guarded({});
  assert.equal(logs.error.length, 2);
  assert.match(logs.error[1], /channel closed/);
});

test('Amq marks a job settled only after the ack or reject went through', async () => {
  const amq = new Amq({});
  amq.initialized = true;
  amq.logger = { error() {}, info() {}, warn() {} };
  amq.channel = { ack() {}, reject() {} };
  const acked = {};
  await amq.ack(acked);
  assert.equal(acked.__settled, true);
  const rejected = {};
  await amq.reject(rejected);
  assert.equal(rejected.__settled, true);

  amq.channel = { ack() { throw new Error('no'); }, reject() { throw new Error('no'); } };
  const failed = {};
  await amq.ack(failed);
  await amq.reject(failed);
  assert.equal(failed.__settled, undefined);
});

test('a consumer cancellation calls onCancel, once per cancelled consumer', async () => {
  let cancels = 0;
  const t = setup(async () => {}, { onCancel: () => { cancels++; } });
  await t.guarded(null);
  await t.guarded(null);
  assert.equal(cancels, 2);
  assert.equal(t.calls.reject.length, 0);
});

test('onCancel is not called for a normal job or a failing one', async () => {
  let cancels = 0;
  const t = setup(async job => { if (job.fail) throw new Error('x'); }, { onCancel: () => { cancels++; } });
  await t.guarded({});
  await t.guarded({ fail: true });
  assert.equal(cancels, 0);
});

test('exitOnConsumerCancel exits once, however many consumers are cancelled', () => {
  const exits = [];
  const logs = [];
  const onCancel = exitOnConsumerCancel({ warn() {}, error: m => logs.push(m) }, code => exits.push(code));
  onCancel();
  onCancel();
  onCancel();
  assert.deepEqual(exits, [1]);
  assert.equal(logs.length, 1);
  assert.match(logs[0], /restarted and subscribes again/);
});

function amqWithChannel() {
  const amq = new Amq({});
  amq.logger = { error() {}, info() {}, warn() {} };
  const channel = { consumers: [], acks: [], rejects: [], prefetch() {},
    consume(queue, fn) { this.consumers.push({ queue, fn }); },
    ack(job) { this.acks.push(job); }, reject(job) { this.rejects.push(job); } };
  amq.initialized = true;
  amq.channel = channel;
  return { amq, channel };
}

test('Amq remembers which channel delivered a job, and passes a cancellation through as null', async () => {
  const { amq, channel } = amqWithChannel();
  const received = [];
  await amq.listen('action', msg => received.push(msg));
  const msg = { content: 1 };
  channel.consumers[0].fn(msg);
  channel.consumers[0].fn(null);
  assert.equal(msg.__channel, channel);
  assert.deepEqual(received, [msg, null]);
});

test('a job is settled on the channel that delivered it', async () => {
  const { amq, channel } = amqWithChannel();
  await amq.listen('action', () => {});
  const a = { content: 1 };
  const b = { content: 2 };
  channel.consumers[0].fn(a);
  channel.consumers[0].fn(b);
  await amq.ack(a);
  await amq.reject(b);
  assert.deepEqual(channel.acks, [a]);
  assert.deepEqual(channel.rejects, [b]);
});

test('a job from a replaced channel is not settled on the new one', async () => {
  const { amq, channel: oldChannel } = amqWithChannel();
  await amq.listen('action', () => {});
  const job = { content: 1 };
  oldChannel.consumers[0].fn(job);

  // the connection drops and Amq reconnects with a new channel
  const newChannel = { acks: [], rejects: [], ack(j) { this.acks.push(j); }, reject(j) { this.rejects.push(j); } };
  amq.channel = newChannel;

  await amq.reject(job);
  await amq.ack(job);
  assert.deepEqual(newChannel.rejects, []);
  assert.deepEqual(newChannel.acks, []);
  assert.deepEqual(oldChannel.rejects, []);
  assert.equal(job.__settled, true); // nothing more to do: RabbitMQ requeues it itself
});

test('a job is not settled while disconnected, and no new connection is opened for it', async () => {
  const { amq, channel } = amqWithChannel();
  await amq.listen('action', () => {});
  const job = {};
  channel.consumers[0].fn(job);
  amq.initialized = false;
  let initCalled = false;
  amq.init = async () => { initCalled = true; };
  await amq.reject(job);
  assert.equal(initCalled, false);
  assert.deepEqual(channel.rejects, []);
});
