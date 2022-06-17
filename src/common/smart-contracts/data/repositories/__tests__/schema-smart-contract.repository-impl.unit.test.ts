/* eslint-disable @typescript-eslint/ban-ts-comment */
import { SchemaSmartContractData } from '@common/smart-contracts/domain/entities/schema-smart-contract-data';
import { SmartContractDataNotFoundError } from '@common/smart-contracts/domain/errors/smart-contract-data-not-found.error';
import { EosRpcSource } from '@core/rpc/data/data-sources/eos-rpc.source';
import { SchemaSmartContractTableRow } from '../../smart-contract.dtos';
import { SchemaSmartContractRepositoryImpl } from '../schema-smart-contract.repository-impl';

jest.mock('@core/data/data-sources/eos-rpc.source');

let repository: SchemaSmartContractRepositoryImpl;
const source: EosRpcSource = {
  getTableRows: async () => [],
};

describe('SchemaSmartContractRepositoryImpl unit tests', () => {
  it('"getData" should return failure when smart contract couldnt be found', async () => {
    const getTableRowsMock = jest
      .spyOn(source, 'getTableRows')
      .mockResolvedValue([]);
    repository = new SchemaSmartContractRepositoryImpl(source);

    const result = await repository.getData('foo', 'bar');
    expect(result.content).toBeUndefined();
    expect(result.failure.error).toBeInstanceOf(SmartContractDataNotFoundError);

    getTableRowsMock.mockClear();
  });

  it('"getData" should return entity from the data source and store it in the local storage', async () => {
    const dto: SchemaSmartContractTableRow = {
      format: [
        {
          name: 'foo',
          type: 'any',
        },
      ],
    };
    const getTableRowsMock = jest
      .spyOn(source, 'getTableRows')
      .mockResolvedValue([dto]);
    repository = new SchemaSmartContractRepositoryImpl(source);

    const result = await repository.getData('foo', 'bar');
    expect(result.content).toBeInstanceOf(SchemaSmartContractData);
    expect(result.failure).toBeUndefined();
    //@ts-ignore
    expect(repository.storage.get('foo::bar')).toEqual(result.content);

    getTableRowsMock.mockClear();
  });

  it('"getData" should return entity from the storage', async () => {
    const dto: SchemaSmartContractTableRow = {
      format: [
        {
          name: 'foo',
          type: 'any',
        },
      ],
    };
    const getTableRowsMock = jest
      .spyOn(source, 'getTableRows')
      .mockResolvedValue([dto]);
    repository = new SchemaSmartContractRepositoryImpl(source);

    //@ts-ignore
    repository.storage.set('foo::bar', SchemaSmartContractData.fromDto(dto));
    const result = await repository.getData('foo', 'bar');
    expect(result.content).toBeInstanceOf(SchemaSmartContractData);
    expect(result.failure).toBeUndefined();

    getTableRowsMock.mockClear();
  });
});
