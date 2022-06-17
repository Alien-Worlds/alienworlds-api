/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TemplateSmartContractData } from '@common/smart-contracts/domain/entities/template-smart-contract-data';
import { SmartContractDataNotFoundError } from '@common/smart-contracts/domain/errors/smart-contract-data-not-found.error';
import { EosRpcSource } from '@core/rpc/data/data-sources/eos-rpc.source';
import { TemplateSmartContractTableRow } from '../../smart-contract.dtos';
import { TemplateSmartContractRepositoryImpl } from '../template-smart-contract.repository-impl';

jest.mock('@core/data/data-sources/eos-rpc.source');

let repository: TemplateSmartContractRepositoryImpl;
const source: EosRpcSource = {
  getTableRows: async () => [],
};

describe('TemplateSmartContractRepositoryImpl unit tests', () => {
  it('"getData" should return failure when smart contract couldnt be found', async () => {
    const getTableRowsMock = jest
      .spyOn(source, 'getTableRows')
      .mockResolvedValue([]);
    repository = new TemplateSmartContractRepositoryImpl(source);

    const result = await repository.getData('foo', 'bar');
    expect(result.content).toBeUndefined();
    expect(result.failure.error).toBeInstanceOf(SmartContractDataNotFoundError);

    getTableRowsMock.mockClear();
  });

  it('"getData" should return entity from the data source and store it in the local storage', async () => {
    const dto: TemplateSmartContractTableRow = {
      schema_name: 'foo',
      immutable_serialized_data: Uint8Array.from([]),
    };
    const getTableRowsMock = jest
      .spyOn(source, 'getTableRows')
      .mockResolvedValue([dto]);
    repository = new TemplateSmartContractRepositoryImpl(source);

    const result = await repository.getData('foo', 'bar');
    expect(result.content).toBeInstanceOf(TemplateSmartContractData);
    expect(result.failure).toBeUndefined();
    //@ts-ignore
    expect(repository.storage.get('foo::bar')).toEqual(result.content);

    getTableRowsMock.mockClear();
  });

  it('"getData" should return entity from the storage', async () => {
    const dto: TemplateSmartContractTableRow = {
      schema_name: 'foo',
      immutable_serialized_data: Uint8Array.from([]),
    };
    const getTableRowsMock = jest
      .spyOn(source, 'getTableRows')
      .mockResolvedValue([dto]);
    repository = new TemplateSmartContractRepositoryImpl(source);

    //@ts-ignore
    repository.storage.set('foo::bar', TemplateSmartContractData.fromDto(dto));
    const result = await repository.getData('foo', 'bar');
    expect(result.content).toBeInstanceOf(TemplateSmartContractData);
    expect(result.failure).toBeUndefined();

    getTableRowsMock.mockClear();
  });
});
