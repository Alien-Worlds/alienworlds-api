/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require('ts-jest');
const config = require('./jest.config.js');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  ...config,
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/__tests__/**/*.unit.test.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src/',
  }),
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/use-case.ts',
    '!**/*.fixture.ts',
    '!**/*.mock.ts',
    '!**/*.error.ts',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/schemas/**',
    '!src/**/index.ts',
    '!src/**/*.repository.ts',
    '!src/**/*.enums.ts',
    '!src/**/worker.ts',
    '!src/**/ioc.config.ts',
    '!src/**/*.ioc.config.ts',
    '!src/**/eos-rpc.source.ts',
    '!src/**/state-history.source.ts',
    '!src/mongo_setup.ts',
  ],
};
