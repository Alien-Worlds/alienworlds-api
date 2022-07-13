/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SmartContractDataNotFoundError } from '@common/smart-contracts/domain/errors/smart-contract-data-not-found.error';
import { EosRpcSource } from '@core/rpc/data/data-sources/eos-rpc.source';
import { SmartContractRepositoryImpl } from '../smart-contract.repository-impl';

let repository: SmartContractRepositoryImpl<any, any>;
const source: EosRpcSource = {
  getTableRows: async () => [],
};

describe('SmartContractRepositoryImpl unit tests', () => {
  it('"store" should add entity to the storage and return that entity', async () => {
    const entity = { foo: 1 };
    const key = 'foo::bar';
    repository = new SmartContractRepositoryImpl<any, any>(source, '');
    // @ts-ignore
    const result = repository.store(key, entity);

    expect(result).toEqual(entity);
    // @ts-ignore
    expect(repository.storage.size).toEqual(1);
    // @ts-ignore
    expect(repository.storage.get(key)).toEqual(entity);
  });

  it('"store" should log warning message and override entity when key is already in use', async () => {
    const entity = { foo: 1 };
    const key = 'foo::bar';
    const warnMock = jest.spyOn(console, 'warn');
    repository = new SmartContractRepositoryImpl<any, any>(source, '');
    // @ts-ignore
    repository.storage.set(key, { bar: 1 });
    // @ts-ignore
    const result = repository.store(key, entity);

    expect(result).toEqual(entity);
    // @ts-ignore
    expect(repository.storage.size).toEqual(1);
    // @ts-ignore
    expect(repository.storage.get(key)).toEqual(entity);

    expect(warnMock).toBeCalled();
    warnMock.mockClear();
  });

  it('"getOneRowBy" should call source.getTableRows and return an object', async () => {
    const dto = { foo: 1 };
    const getTableRowsMock = jest.spyOn(source, 'getTableRows');
    repository = new SmartContractRepositoryImpl<any, any>(source, '');
    getTableRowsMock.mockResolvedValue([dto]);
    // @ts-ignore
    const result = await repository.getOneRowBy('', '');

    expect(getTableRowsMock).toBeCalled();
    expect(result).toEqual(dto);
    getTableRowsMock.mockClear();
  });

  it('"getOneRowBy" should throw SmartContractDataNotFoundError when expected object was not found', async () => {
    const getTableRowsMock = jest.spyOn(source, 'getTableRows');
    repository = new SmartContractRepositoryImpl<any, any>(source, '');
    getTableRowsMock.mockResolvedValue([]);

    try {
      // @ts-ignore
      await repository.getOneRowBy('', '');
    } catch (error) {
      expect(error).toBeInstanceOf(SmartContractDataNotFoundError);
    }

    getTableRowsMock.mockClear();
  });
});
