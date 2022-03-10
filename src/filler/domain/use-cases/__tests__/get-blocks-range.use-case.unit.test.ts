/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Config, config } from '../../../../config';
import { BlocksRange } from '../../entities/blocks-range';
import { FillerOptions } from '../../entities/filler-options';
import { GetLastBlockUseCase } from '../../../../common/mines/domain/use-cases/get-last-block.use-case';
import { GetBlocksRangeUseCase } from '../get-blocks-range.use-case';
import { GetLastIrreversableBlockNumUseCase } from '../get-last-irreversable-block-number.use-case';
import { Result } from '../../../../core/domain/result';
import { Container } from 'inversify';
import { Failure } from '@core/domain/failure';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('../../../../common/mines/domain/use-cases/get-last-block.use-case');
jest.mock('../get-last-irreversable-block-number.use-case');

let container: Container;
let useCase: GetBlocksRangeUseCase;

describe('GetBlocksRangeUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<GetLastBlockUseCase>(GetLastBlockUseCase.Token)
      .to(GetLastBlockUseCase);
    container
      .bind<GetLastIrreversableBlockNumUseCase>(
        GetLastIrreversableBlockNumUseCase.Token
      )
      .to(GetLastIrreversableBlockNumUseCase);
    container
      .bind<GetBlocksRangeUseCase>(GetBlocksRangeUseCase.Token)
      .to(GetBlocksRangeUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetBlocksRangeUseCase>(GetBlocksRangeUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetBlocksRangeUseCase.Token).not.toBeNull();
  });

  it('Should return BlocksRange with values set in the config', async () => {
    const options = FillerOptions.fromOptionValues({});
    const result = await useCase.execute(options);
    expect(result.content).toEqual(
      BlocksRange.create(configMock.startBlock, configMock.endBlock)
    );
  });

  it('Should return BlocksRange ', async () => {
    const options = FillerOptions.fromOptionValues({
      endBlock: 10000,
    });
    const result = await useCase.execute(options);
    expect(result.content).toEqual(
      BlocksRange.create(configMock.startBlock, 10000)
    );
  });

  it('Should execute GetLastBlockUseCase when given startBlock is equal -1', async () => {
    const blockNum = 200;
    const executeMock = jest
      .spyOn(GetLastBlockUseCase.prototype, 'execute')
      .mockResolvedValue(Result.withContent<any>({ blockNum }));
    const options = FillerOptions.fromOptionValues({
      startBlock: -1,
      endBlock: 10000,
    });
    const result = await useCase.execute(options);
    expect(executeMock).toBeCalledTimes(1);
    expect(result.content).toEqual(BlocksRange.create(blockNum, 10000));
  });

  it('Should return failure when GetLastBlockUseCase fails', async () => {
    const executeMock = jest
      .spyOn(GetLastBlockUseCase.prototype, 'execute')
      .mockResolvedValue(Result.withFailure(Failure.withMessage('fail')));
    const options = FillerOptions.fromOptionValues({
      startBlock: -1,
      endBlock: 10000,
    });
    const result = await useCase.execute(options);
    expect(executeMock).toBeCalledTimes(1);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });

  it('Should execute GetLastBlockUseCase when given startBlock is equal -1', async () => {
    const lastBlock = 123456;
    const executeMock = jest
      .spyOn(GetLastIrreversableBlockNumUseCase.prototype, 'execute')
      .mockResolvedValue(Result.withContent<number>(lastBlock));
    const options = FillerOptions.fromOptionValues({
      replay: true,
      startBlock: 10000,
      endBlock: 0xffffffff,
    });
    const result = await useCase.execute(options);
    expect(executeMock).toBeCalledTimes(1);
    expect(result.content).toEqual(
      BlocksRange.create(options.startBlock, lastBlock)
    );
  });

  it('Should return failure when GetLastIrreversableBlockNumUseCase fails', async () => {
    const executeMock = jest
      .spyOn(GetLastIrreversableBlockNumUseCase.prototype, 'execute')
      .mockResolvedValue(Result.withFailure(Failure.withMessage('fail')));
    const options = FillerOptions.fromOptionValues({
      replay: true,
      startBlock: 10000,
      endBlock: 0xffffffff,
    });
    const result = await useCase.execute(options);
    expect(executeMock).toBeCalledTimes(1);
    expect(result.content).toBeUndefined();
    expect(result.failure).toBeInstanceOf(Failure);
  });
});
