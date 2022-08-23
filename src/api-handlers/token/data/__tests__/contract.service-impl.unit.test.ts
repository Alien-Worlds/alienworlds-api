/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ContractServiceImpl } from '../contract.service-impl';

const contractMock = {
  balanceOf: jest.fn(),
};

describe('ContractServiceImpl Unit tests', () => {
  it('Should result with the list of MineLuck entities', async () => {
    contractMock.balanceOf.mockResolvedValue('1000.0000');
    const service = new ContractServiceImpl(contractMock as any);

    const result = await service.getBalance('foo_address');

    expect(result.content).toEqual(1000);
  });

  it('Should result with failure when data source operation fails', async () => {
    contractMock.balanceOf.mockImplementation(() => {
      throw new Error('something went wrong');
    });
    const service = new ContractServiceImpl(contractMock);

    const result = await service.getBalance('foo_address');

    expect(result.isFailure).toEqual(true);
  });
});
