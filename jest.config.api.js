const { config } = require('./jest.config');

module.exports = {
  ...config,
  collectCoverage: false,
  // testEnvironment: './.jest/fastify.env.ts',
  testEnvironment: 'jest-environment-node',
  testMatch: ["**/tests/api/**/*.api.test.ts"]
};