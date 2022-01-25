const { config } = require('./jest.config');

module.exports = {
  ...config,
  collectCoverage: false,
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/tests/api/**/*.api.test.ts'],
  testPathIgnorePatterns: ['<rootDir>/src/'],
};
