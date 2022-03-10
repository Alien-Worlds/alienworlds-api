/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require('ts-jest');
const config = require('./jest.config.js');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  ...config,
  collectCoverage: false,
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/tests/api/**/*.api.test.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src/',
  }),
};
