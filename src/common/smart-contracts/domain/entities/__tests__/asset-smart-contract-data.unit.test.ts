/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AssetSmartContractData } from '../asset-smart-contract-data';

describe('AssetSmartContractData Unit tests', () => {
  it('Should create entity based on dto', () => {
    const dto = {
      collection_name: 'foo',
      schema_name: 'bar',
      template_id: '111',
    };
    const entity = AssetSmartContractData.fromDto(dto);

    expect(entity).toEqual({
      collectionName: 'foo',
      schemaName: 'bar',
      templateId: 111,
    });
  });
});
