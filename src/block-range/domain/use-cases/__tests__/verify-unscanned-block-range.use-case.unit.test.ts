/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { BlockRangeScanRepository } from '@common/block-range-scan/domain/repositories/block-range-scan.repository';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { WorkerOrchestrator } from '@core/architecture/workers/worker-orchestrator';
import { VerifyUnscannedBlockRangeUseCase } from '../verify-unscanned-block-range.use-case';
import { BlockRangeScanReadTimeoutError } from '../../../domain/errors/block-range-scan-read-timeout.error';

const blockRangeScanRepositoryMock = {
  hasUnscannedNodes: jest.fn(),
};

let container: Container;
let useCase: VerifyUnscannedBlockRangeUseCase;

WorkerOrchestrator.sendToOrchestrator = jest.fn();

describe('VerifyUnscannedBlockRangeUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<BlockRangeScanRepository>(BlockRangeScanRepository.Token)
      .toConstantValue(blockRangeScanRepositoryMock as any);
    container
      .bind<VerifyUnscannedBlockRangeUseCase>(
        VerifyUnscannedBlockRangeUseCase.Token
      )
      .to(VerifyUnscannedBlockRangeUseCase);
  });

  beforeEach(() => {
    useCase = container.get<VerifyUnscannedBlockRangeUseCase>(
      VerifyUnscannedBlockRangeUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(VerifyUnscannedBlockRangeUseCase.Token).not.toBeNull();
  });

  it('Should use the maximum number of attempts to verify the blocks', async () => {
    blockRangeScanRepositoryMock.hasUnscannedNodes.mockResolvedValue(
      Result.withContent(false)
    );
    const attempts = 4;
    const result = await useCase.execute('test', attempts);

    expect(blockRangeScanRepositoryMock.hasUnscannedNodes).toBeCalledTimes(
      attempts
    );
    expect(result.failure.error).toBeInstanceOf(BlockRangeScanReadTimeoutError);
    expect(result.content).toBeUndefined();

    blockRangeScanRepositoryMock.hasUnscannedNodes.mockClear();
  });

  it('Should result with "true" when unscanned nodes are found', async () => {
    blockRangeScanRepositoryMock.hasUnscannedNodes
      .mockResolvedValue(Result.withContent(false))
      .mockResolvedValue(Result.withContent(true));

    const result = await useCase.execute('test');

    expect(result.failure).toBeUndefined();
    expect(result.content).toEqual(true);

    blockRangeScanRepositoryMock.hasUnscannedNodes.mockClear();
  });
});
