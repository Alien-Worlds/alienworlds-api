/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Config, config } from '../../../../config';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { CreateBlockRangeScanUseCase } from '../create-block-range-scan.use-case';
import { BlockRangeScanRepository } from '@common/block-range-scan/domain/repositories/block-range-scan.repository';
import { DuplicateBlockRangeScanError } from '../../../domain/errors/duplicate-block-range-scan.error';
import { Failure } from '@core/architecture/domain/failure';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('@common/mines/domain/use-cases/get-last-block.use-case');
jest.mock('../get-last-irreversable-block-number.use-case');

const blockRangeScanRepositoryMock = {
  hasScanKey: jest.fn(),
  createScanNodes: jest.fn(),
};

let container: Container;
let useCase: CreateBlockRangeScanUseCase;

describe('GetBlocksRangeUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<BlockRangeScanRepository>(BlockRangeScanRepository.Token)
      .toConstantValue(blockRangeScanRepositoryMock as any);
    container
      .bind<CreateBlockRangeScanUseCase>(CreateBlockRangeScanUseCase.Token)
      .to(CreateBlockRangeScanUseCase);
  });

  beforeEach(() => {
    useCase = container.get<CreateBlockRangeScanUseCase>(
      CreateBlockRangeScanUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(CreateBlockRangeScanUseCase.Token).not.toBeNull();
  });

  it('Should return a failure with DuplicateBlockRangeScanError when scan key was found in database', async () => {
    blockRangeScanRepositoryMock.hasScanKey.mockResolvedValue(
      Result.withContent(true)
    );

    const result = await useCase.execute('test', 0n, 1n);

    expect(blockRangeScanRepositoryMock.hasScanKey).toBeCalledWith(
      'test',
      0n,
      1n
    );
    expect(result.failure.error).toBeInstanceOf(DuplicateBlockRangeScanError);
  });

  it('Should call repository createScanNodes method', async () => {
    blockRangeScanRepositoryMock.hasScanKey.mockResolvedValue(
      Result.withContent(false)
    );

    await useCase.execute('test', 0n, 1n);

    expect(blockRangeScanRepositoryMock.hasScanKey).toBeCalledWith(
      'test',
      0n,
      1n
    );
    expect(blockRangeScanRepositoryMock.createScanNodes).toBeCalledWith(
      'test',
      0n,
      1n
    );
  });

  it('Should return a failure on any error', async () => {
    blockRangeScanRepositoryMock.hasScanKey.mockResolvedValue(
      Result.withFailure(Failure.fromError(new Error()))
    );

    const result = await useCase.execute('test', 0n, 1n);

    expect(result.failure).toBeInstanceOf(Failure);
    expect(result.content).toBeUndefined();
  });
});
