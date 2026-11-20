const { test } = require('node:test');
const assert = require('node:assert/strict');
const { exponentialDelay } = require('../dist/include/backoff');

test('starts at the base delay, doubles, and stops at the maximum', () => {
  const delays = [1, 2, 3, 4, 5, 6].map(n => exponentialDelay(n, 1000, 10000));
  assert.deepEqual(delays, [1000, 2000, 4000, 8000, 10000, 10000]);
});

test('an attempt below 1 is treated as the first', () => {
  assert.equal(exponentialDelay(0, 500, 5000), 500);
});
