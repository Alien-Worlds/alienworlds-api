/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Failure } from '@core/architecture/domain/failure';
import { Container } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { BlockRangeScanRepository } from '../../repositories/block-range-scan.repository';
import { StartNextScanUseCase } from '../start-next-scan.use-case';
import { BlockRangeScan } from '../../entities/block-range-scan';

const blockRangeScanRepository = {
  startNextScan: jest.fn(() => {}),
} as any;

let container: Container;
let useCase: StartNextScanUseCase;

describe('StartNextScanUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<BlockRangeScanRepository>(BlockRangeScanRepository.Token)
      .toConstantValue(blockRangeScanRepository);
    container
      .bind<StartNextScanUseCase>(StartNextScanUseCase.Token)
      .to(StartNextScanUseCase);
  });

  beforeEach(() => {
    useCase = container.get<StartNextScanUseCase>(StartNextScanUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(StartNextScanUseCase.Token).not.toBeNull();
  });

  it('Should call BlockRangeScanRepository startNextScan method and return its result', async () => {
    blockRangeScanRepository.startNextScan = jest.fn(() =>
      Result.withContent(BlockRangeScan.create(0n, 1n, 'test', 0))
    );

    const { content, failure } = await useCase.execute('test');

    expect(blockRangeScanRepository.startNextScan).toBeCalled();
    expect(content).toBeInstanceOf(BlockRangeScan);
    expect(failure).toBeUndefined();
  });

  it('Should return a failure ', async () => {
    blockRangeScanRepository.startNextScan = jest.fn(() =>
      Result.withFailure(Failure.fromError(new Error()))
    );

    const { content, failure } = await useCase.execute('test');

    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });
});
