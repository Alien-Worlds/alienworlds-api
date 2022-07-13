/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import 'reflect-metadata';
import { BlockRangeProcess } from '../block-range.process';
import { VerifyUnscannedBlockRangeUseCase } from '../use-cases/verify-unscanned-block-range.use-case';
import { StartBlockRangeScanUseCase } from '../use-cases/start-block-range-scan.use-case';

jest.mock('@config', () => ({
  config: { blockrangeThreads: 8, blockrangeInviolableThreads: 2 },
}));

jest.mock('@core/architecture/workers/worker.utils', () => ({
  getWorkersCount: () => 2,
}));

const startBlockRangeScanUseCaseMock = {
  execute: jest.fn(),
};
const verifyUnscannedBlockRangeUseCaseMock = {
  execute: jest.fn(),
};

let container: Container;
let program: BlockRangeProcess;

describe('BlockRange Process Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<StartBlockRangeScanUseCase>(StartBlockRangeScanUseCase.Token)
      .toConstantValue(startBlockRangeScanUseCaseMock as any);
    container
      .bind<VerifyUnscannedBlockRangeUseCase>(
        VerifyUnscannedBlockRangeUseCase.Token
      )
      .toConstantValue(verifyUnscannedBlockRangeUseCaseMock as any);
    container
      .bind<BlockRangeProcess>(BlockRangeProcess.Token)
      .to(BlockRangeProcess);
  });

  beforeEach(() => {
    program = container.get<BlockRangeProcess>(BlockRangeProcess.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(BlockRangeProcess.Token).not.toBeNull();
  });

  it('Should verify unscanned nodes first and send message to the main thread when it verification fails', async () => {
    verifyUnscannedBlockRangeUseCaseMock.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('FAIL'))
    );
    const sendToMainThreadMock = jest
      .spyOn(program as any, 'sendToMainThread')
      .mockImplementation();

    await program.start('test');
    expect(sendToMainThreadMock).toBeCalled();

    verifyUnscannedBlockRangeUseCaseMock.execute.mockClear();
    sendToMainThreadMock.mockClear();
  });

  it('Should call startBlockRangeScanUseCase', async () => {
    verifyUnscannedBlockRangeUseCaseMock.execute.mockResolvedValue(true);

    await program.start('test');

    expect(startBlockRangeScanUseCaseMock.execute).toBeCalled();

    verifyUnscannedBlockRangeUseCaseMock.execute.mockClear();
    startBlockRangeScanUseCaseMock.execute.mockClear();
  });
});
