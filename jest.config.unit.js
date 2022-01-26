// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./jest.config.js');

module.exports = {
  ...config,
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/__tests__/**/*.unit.test.ts'],
};
