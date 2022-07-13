import { AssetSmartContractData } from '@common/smart-contracts/domain/entities/asset-smart-contract-data';
import { SmartContractDataNotFoundError } from '@common/smart-contracts/domain/errors/smart-contract-data-not-found.error';
import { EosRpcSource } from '@core/rpc/data/data-sources/eos-rpc.source';
import { AssetSmartContractTableRow } from '../../smart-contract.dtos';
import { AssetSmartContractRepositoryImpl } from '../asset-smart-contract.repository-impl';

jest.mock('@core/rpc/data/data-sources/eos-rpc.source');

let repository: AssetSmartContractRepositoryImpl;
const source: EosRpcSource = {
  getTableRows: async () => [],
};

describe('AssetSmartContractRepositoryImpl unit tests', () => {
  it('"getData" should return failure when smart contract couldnt be found', async () => {
    const getTableRowsMock = jest
      .spyOn(source, 'getTableRows')
      .mockResolvedValue([]);
    repository = new AssetSmartContractRepositoryImpl(source);

    const result = await repository.getData('foo', 'bar');
    expect(result.content).toBeUndefined();
    expect(result.failure.error).toBeInstanceOf(SmartContractDataNotFoundError);

    getTableRowsMock.mockClear();
  });

  it('"getData" should return entity from the data source', async () => {
    const dto: AssetSmartContractTableRow = {
      collection_name: 'foo',
      schema_name: 'bar',
      template_id: '1',
    };
    const getTableRowsMock = jest
      .spyOn(source, 'getTableRows')
      .mockResolvedValue([dto]);
    repository = new AssetSmartContractRepositoryImpl(source);

    const result = await repository.getData('foo', 'bar');
    expect(result.content).toBeInstanceOf(AssetSmartContractData);
    expect(result.failure).toBeUndefined();

    getTableRowsMock.mockClear();
  });
});
