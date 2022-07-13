/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { AbiRepositoryImpl } from '../abi.repository-impl';
import { Abi } from '@common/abi/domain/entities/abi';
import { Failure } from '@core/architecture/domain/failure';

describe('AbiRepositoryImpl Unit tests', () => {
  it('"createAbi" should return result with Abi entity', () => {
    const repo = new AbiRepositoryImpl();
    const result = repo.createAbi({
      version: 'version-1',
      types: [],
      structs: [],
      tables: [],
      actions: [],
      ricardian_clauses: [],
      abi_extensions: [],
      error_messages: [],
    });

    expect(result.content).toBeInstanceOf(Abi);
    expect(result.failure).toBeUndefined();
  });

  it('"createAbi" should return result with a failure object in case of an error', () => {
    const repo = new AbiRepositoryImpl();
    const result = repo.createAbi({} as any);

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"getCurrentAbi" should return result object with Abi entity', () => {
    const repo = new AbiRepositoryImpl();
    repo.createAbi({
      version: 'version-1',
      types: [],
      structs: [],
      tables: [],
      actions: [],
      ricardian_clauses: [],
      abi_extensions: [],
      error_messages: [],
    });
    const result = repo.getCurrentAbi();

    expect(result.content).toBeInstanceOf(Abi);
    expect(result.failure).toBeUndefined();
  });

  it('"getCurrentAbi" should return result with a failure object in case of an error', () => {
    const repo = new AbiRepositoryImpl();
    const result = repo.getCurrentAbi();

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('"clearCurrentAbi" should remove current abi', () => {
    const repo = new AbiRepositoryImpl();
    repo.createAbi({
      version: 'version-1',
      types: [],
      structs: [],
      tables: [],
      actions: [],
      ricardian_clauses: [],
      abi_extensions: [],
      error_messages: [],
    });
    const result = repo.clearCurrentAbi();

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('"clearCurrentAbi" should return result with a failure object in case of an error', () => {
    const repo = new AbiRepositoryImpl();
    const result = repo.clearCurrentAbi();

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });
});
