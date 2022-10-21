/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('./jest.config.js');

module.exports = {
  ...config,
  collectCoverage: false,
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/tests/api/**/*.api.test.ts'],
};
