/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SchemaSmartContractData } from '../schema-smart-contract-data';

describe('SchemaSmartContractData Unit tests', () => {
  it('Should create entity based on dto', () => {
    const format = [
      {
        name: 'foo',
        type: 'some.type',
      },
    ];
    const dto = {
      format,
    };
    const entity = SchemaSmartContractData.fromDto(dto);

    expect(entity).toEqual({
      format,
    });
  });
});
