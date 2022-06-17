/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Config, config } from '../../../../config';
import { GetLastBlockUseCase } from '@common/mines/domain/use-cases/get-last-block.use-case';
import { GetBlockRangeUseCase } from '../get-block-range.use-case';
import { GetLastIrreversableBlockNumUseCase } from '../get-last-irreversable-block-number.use-case';
import { Result } from '@core/architecture/domain/result';
import { Container } from 'inversify';
import { BlockRange } from '@common/block-range/domain/entities/block-range';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('@common/mines/domain/use-cases/get-last-block.use-case');
jest.mock('../get-last-irreversable-block-number.use-case');

const getLastBlockUseCaseMock = new GetLastBlockUseCase(null);
const getLastIrreversableBlockNumUseCaseMock =
  new GetLastIrreversableBlockNumUseCase(null);
let container: Container;
let useCase: GetBlockRangeUseCase;

describe('GetBlocksRangeUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<GetLastBlockUseCase>(GetLastBlockUseCase.Token)
      .toConstantValue(getLastBlockUseCaseMock);
    container
      .bind<GetLastIrreversableBlockNumUseCase>(
        GetLastIrreversableBlockNumUseCase.Token
      )
      .toConstantValue(getLastIrreversableBlockNumUseCaseMock);
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

  // it('"Token" should be set', () => {
  //   expect(GetBlocksRangeUseCase.Token).not.toBeNull();
  // });

  // it('Should return BlockRange ', async () => {
  //   configMock.startBlock = 100;
  //   const options = FillerOptions.fromOptionValues({
  //     endBlock: 10000n,
  //   });
  //   const result = await useCase.execute(options);
  //   expect(result.content).toEqual(
  //     BlockRange.create(configMock.startBlock, 10000n)
  //   );
  // });

  // it('Should execute GetLastBlockUseCase when given startBlock is equal -1', async () => {
  //   configMock.startBlock = 100;
  //   const blockNum = 200n;
  //   const executeMock = jest
  //     .spyOn(getLastBlockUseCaseMock, 'execute')
  //     .mockResolvedValue(Result.withContent<any>({ blockNum }));
  //   const options = FillerOptions.fromOptionValues({
  //     startBlock: -1n,
  //     endBlock: 10000n,
  //   });
  //   const result = await useCase.execute(options);
  //   expect(executeMock).toBeCalledTimes(1);
  //   expect(result.content).toEqual(BlockRange.create(blockNum, 10000n));
  // });

  // it('Should return failure when GetLastBlockUseCase fails', async () => {
  //   const executeMock = jest
  //     .spyOn(getLastBlockUseCaseMock, 'execute')
  //     .mockResolvedValue(Result.withFailure(Failure.withMessage('fail')));
  //   const options = FillerOptions.fromOptionValues({
  //     startBlock: -1n,
  //     endBlock: 10000n,
  //   });
  //   const result = await useCase.execute(options);
  //   expect(executeMock).toBeCalledTimes(1);
  //   expect(result.content).toBeUndefined();
  //   expect(result.failure).toBeInstanceOf(Failure);
  // });

  it('Should execute GetLastBlockUseCase when given startBlock is equal -1', async () => {
    const lastBlock = 123456n;
    const executeMock = jest
      .spyOn(getLastIrreversableBlockNumUseCaseMock, 'execute')
      .mockResolvedValue(Result.withContent<bigint>(lastBlock));
    const result = await useCase.execute(10000n, 0xffffffffn, true);
    expect(executeMock).toBeCalledTimes(1);
    expect(result.content).toEqual(BlockRange.create(10000n, lastBlock));
  });

  // it('Should return failure when GetLastIrreversableBlockNumUseCase fails', async () => {
  //   const executeMock = jest
  //     .spyOn(getLastIrreversableBlockNumUseCaseMock, 'execute')
  //     .mockResolvedValue(Result.withFailure(Failure.withMessage('fail')));
  //   const options = FillerOptions.fromOptionValues({
  //     replay: true,
  //     startBlock: 10000n,
  //     endBlock: 0xffffffff,
  //   });
  //   const result = await useCase.execute(options);
  //   expect(executeMock).toBeCalledTimes(1);
  //   expect(result.content).toBeUndefined();
  //   expect(result.failure).toBeInstanceOf(Failure);
  // });
});
