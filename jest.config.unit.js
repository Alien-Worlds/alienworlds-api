const { config } = require('./jest.config');

module.exports = {
  ...config,
  testEnvironment: 'jest-environment-node',
  testMatch: ["**/__tests__/**"]
};
