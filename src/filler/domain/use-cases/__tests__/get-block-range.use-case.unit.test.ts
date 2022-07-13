/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Config, config } from '../../../../config';
import { GetLastBlockUseCase } from '@common/mines/domain/use-cases/get-last-block.use-case';
import { GetBlockRangeUseCase } from '../get-block-range.use-case';
import { GetLastIrreversableBlockNumUseCase } from '../get-last-irreversable-block-number.use-case';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { Failure } from '@core/architecture/domain/failure';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('@common/mines/domain/use-cases/get-last-block.use-case');
jest.mock('../get-last-irreversable-block-number.use-case');

const getLastBlockUseCaseMock = { execute: jest.fn() };
const getLastIrreversableBlockNumUseCaseMock = { execute: jest.fn() };
let container: Container;
let useCase: GetBlockRangeUseCase;

describe('GetBlocksRangeUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<GetLastBlockUseCase>(GetLastBlockUseCase.Token)
      .toConstantValue(getLastBlockUseCaseMock as any);
    container
      .bind<GetLastIrreversableBlockNumUseCase>(
        GetLastIrreversableBlockNumUseCase.Token
      )
      .toConstantValue(getLastIrreversableBlockNumUseCaseMock as any);
    container
      .bind<GetBlockRangeUseCase>(GetBlockRangeUseCase.Token)
      .to(GetBlockRangeUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetBlockRangeUseCase>(GetBlockRangeUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetBlockRangeUseCase.Token).not.toBeNull();
  });

  it('Should return BlockRange ', async () => {
    configMock.startBlock = 100;
    const result = await useCase.execute(null, 100n, false);
    expect(result.content).toEqual(
      BlockRange.create(configMock.startBlock, 100n)
    );
  });

  it('Should execute GetLastBlockUseCase when given startBlock is equal -1', async () => {
    configMock.startBlock = 100;
    const blockNum = 200n;
    getLastBlockUseCaseMock.execute.mockImplementation(() =>
      Result.withContent({ blockNumber: blockNum })
    );

    const result = await useCase.execute(-1n, 100n, false);

    expect(getLastBlockUseCaseMock.execute).toBeCalledTimes(1);
    expect(result.content).toEqual(BlockRange.create(blockNum, 100n));
  });

  it('Should return failure when GetLastBlockUseCase fails', async () => {
    getLastBlockUseCaseMock.execute.mockImplementation(() =>
      Result.withFailure(Failure.withMessage('failure'))
    );

    const result = await useCase.execute(-1n, 100n, false);

    expect(getLastBlockUseCaseMock.execute).toBeCalledTimes(1);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('Should execute GetLastBlockUseCase when given startBlock is equal -1', async () => {
    const lastBlock = 123456n;
    getLastIrreversableBlockNumUseCaseMock.execute.mockResolvedValue(
      Result.withContent<bigint>(lastBlock)
    );

    const result = await useCase.execute(10000n, 0xffffffffn, true);

    expect(getLastIrreversableBlockNumUseCaseMock.execute).toBeCalledTimes(1);
    expect(result.content).toEqual(BlockRange.create(10000n, lastBlock));
  });

  it('Should return failure when GetLastIrreversableBlockNumUseCase fails', async () => {
    getLastIrreversableBlockNumUseCaseMock.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('fail'))
    );

    const result = await useCase.execute(1n, 0xffffffffn, true);
    expect(getLastIrreversableBlockNumUseCaseMock.execute).toBeCalledTimes(1);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });
});
