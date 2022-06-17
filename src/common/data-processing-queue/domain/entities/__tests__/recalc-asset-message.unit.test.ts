/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Serialize } from 'eosjs';
import { AssetProcessingJob } from '../asset-processing.job';

jest.mock('eosjs');

const SerialBufferMock = Serialize.SerialBuffer as jest.MockedClass<
  typeof Serialize.SerialBuffer
>;

describe('RecalcAssetMessage Unit tests', () => {
  it('Should create entity based on the message', () => {
    const message = {
      content: {},
    } as any;
    SerialBufferMock.prototype.getUint8Array.mockReturnValue(
      Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7])
    );
    const entity = AssetProcessingJob.fromMessage(message);
    expect(entity.assetId).toEqual(283686952306183n);
  });
});
