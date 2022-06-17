/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { TemplateSmartContractData } from '../template-smart-contract-data';

describe('TemplateSmartContractData Unit tests', () => {
  it('Should create entity based on dto', () => {
    const dto = {
      schema_name: 'foo',
      immutable_serialized_data: Uint8Array.from([]),
    };
    const entity = TemplateSmartContractData.fromDto(dto);

    expect(entity).toEqual({
      schemaName: dto.schema_name,
      immutableSerializedData: dto.immutable_serialized_data,
    });
  });
});
