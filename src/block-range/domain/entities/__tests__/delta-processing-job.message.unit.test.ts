/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DeltaRow } from '@common/state-history/domain/entities/delta';
import { DeltaProcessingJobMessage } from '../delta-processing-job.message';

describe('DeltaProcessingJobMessage Unit tests', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2022-06-24T19:01:30.911Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  it('Should create an entity based on given data', async () => {
    const entity = DeltaProcessingJobMessage.create(
      DeltaRow.create({
        present: true,
        data: Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7]),
      }),
      0n,
      new Date('2022-06-24T19:01:30.911Z'),
      1
    );

    expect(entity.buffer).toEqual(
      Buffer.from([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 98, 182, 10, 10, 0,
        1, 2, 3, 4, 5, 6, 7,
      ])
    );
  });
});
