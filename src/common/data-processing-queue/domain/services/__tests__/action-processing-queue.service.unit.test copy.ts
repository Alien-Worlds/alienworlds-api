/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { ActionProcessingQueueService } from '../action-processing-queue.service';

describe('ActionProcessingQueueService Unit tests', () => {
  it('"Token" should be set', () => {
    expect(ActionProcessingQueueService.Token).not.toBeNull();
  });
});
