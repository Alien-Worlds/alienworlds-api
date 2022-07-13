/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { AssetProcessingQueueService } from '../asset-processing-queue.service';

describe('AssetProcessingQueueService Unit tests', () => {
  it('"Token" should be set', () => {
    expect(AssetProcessingQueueService.Token).not.toBeNull();
  });
});
