/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Failure } from '@core/domain/failure';
import { Result } from '@core/domain/result';
import { Container } from 'inversify';
import { FillerOptions } from '../entities/filler-options';
import { FillerCommandHandler } from '../filler.command-handler';
import { GetBlocksRangeUseCase } from '../use-cases/get-blocks-range.use-case';
import { PopulateBlockRangesUseCase } from '../use-cases/populate-block-ranges.use-case';
import { SetupStateReceiverUseCase } from '../use-cases/setup-state-receiver.use-case';
import { ShiftBlocksRangeUseCase } from '../use-cases/shift-blocks-range.use-case';
import { BlocksRange } from '../entities/blocks-range';

jest.mock('../use-cases/get-blocks-range.use-case');
jest.mock('../use-cases/populate-block-ranges.use-case');
jest.mock('../use-cases/setup-state-receiver.use-case');
jest.mock('../use-cases/shift-blocks-range.use-case');

const getBlocksRangeUseCaseMock = new GetBlocksRangeUseCase(null, null);
const populateBlockRangesUseCaseMock = new PopulateBlockRangesUseCase(null);
const shiftBlocksRangeUseCaseCaseMock = new ShiftBlocksRangeUseCase();
const setupStateReceiverUseCaseCaseMock = new SetupStateReceiverUseCase(
  null,
  null
);

let container: Container;
let commandHandler: FillerCommandHandler;
let executeGetBlocksRangeUseCaseMock;
let executePopulateBlockRangesUseCaseMock;
let executeShiftBlocksRangeUseCaseCaseMock;
let executeSetupStateReceiverUseCaseCaseMock;

describe('FillerCommandHandler Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<PopulateBlockRangesUseCase>(PopulateBlockRangesUseCase.Token)
      .toConstantValue(populateBlockRangesUseCaseMock);
    container
      .bind<ShiftBlocksRangeUseCase>(ShiftBlocksRangeUseCase.Token)
      .toConstantValue(shiftBlocksRangeUseCaseCaseMock);
    container
      .bind<GetBlocksRangeUseCase>(GetBlocksRangeUseCase.Token)
      .toConstantValue(getBlocksRangeUseCaseMock);
    container
      .bind<SetupStateReceiverUseCase>(SetupStateReceiverUseCase.Token)
      .toConstantValue(setupStateReceiverUseCaseCaseMock);
    container
      .bind<FillerCommandHandler>(FillerCommandHandler.Token)
      .to(FillerCommandHandler);
  });

  beforeEach(() => {
    commandHandler = container.get<FillerCommandHandler>(
      FillerCommandHandler.Token
    );
    executeGetBlocksRangeUseCaseMock = jest.spyOn(
      getBlocksRangeUseCaseMock,
      'execute'
    );
    executePopulateBlockRangesUseCaseMock = jest.spyOn(
      populateBlockRangesUseCaseMock,
      'execute'
    );
    executeShiftBlocksRangeUseCaseCaseMock = jest.spyOn(
      shiftBlocksRangeUseCaseCaseMock,
      'execute'
    );
    executeSetupStateReceiverUseCaseCaseMock = jest
      .spyOn(setupStateReceiverUseCaseCaseMock, 'execute')
      .mockImplementation(() =>
        Result.withContent(<any>{
          start: () => {
            //
          },
        })
      );
  });

  afterEach(() => {
    executeGetBlocksRangeUseCaseMock.mockReset();
    executePopulateBlockRangesUseCaseMock.mockReset();
    executeShiftBlocksRangeUseCaseCaseMock.mockReset();
    executeSetupStateReceiverUseCaseCaseMock.mockReset();
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(FillerCommandHandler.Token).not.toBeNull();
  });

  it('Should throw an error when block range is not set', async () => {
    const options = FillerOptions.fromOptionValues({});
    executeGetBlocksRangeUseCaseMock.mockResolvedValue(
      Result.withFailure(Failure.withMessage('fail'))
    );

    await commandHandler.run(options).catch(error => {
      expect(error).toBeInstanceOf(Error);
    });
  });

  it('Should execute ShiftBlocksRangeUseCase when replay and continueWithFiller options are true', async () => {
    const options = FillerOptions.fromOptionValues({
      replay: true,
      continueWithFiller: true,
    });
    executeGetBlocksRangeUseCaseMock.mockResolvedValue(
      Result.withContent(BlocksRange.create(0, 100))
    );
    executePopulateBlockRangesUseCaseMock.mockResolvedValue(
      Result.withContent({ sent: 0, total: 0 })
    );
    executeShiftBlocksRangeUseCaseCaseMock.mockResolvedValue(
      Result.withContent(BlocksRange.create(0, 100))
    );

    await commandHandler.run(options);
    expect(executePopulateBlockRangesUseCaseMock).toBeCalled();
  });

  it('Should exit with code 0 when continueWithFiller is false', async () => {
    const realProcess = process;
    const exitMock = jest.fn();
    const options = FillerOptions.fromOptionValues({
      replay: true,
      continueWithFiller: false,
    });
    executeGetBlocksRangeUseCaseMock.mockResolvedValue(
      Result.withContent(BlocksRange.create(0, 100))
    );
    executePopulateBlockRangesUseCaseMock.mockResolvedValue(
      Result.withContent({ sent: 0, total: 0 })
    );
    executeShiftBlocksRangeUseCaseCaseMock.mockResolvedValue(
      Result.withContent(BlocksRange.create(0, 100))
    );

    global.process = { ...realProcess, exit: exitMock as any };

    await commandHandler.run(options);
    expect(executePopulateBlockRangesUseCaseMock).toBeCalled();

    expect(exitMock).toHaveBeenCalledWith(0);
    global.process = realProcess;
  });

  it('Should throw an error when setting up state receive fails', async () => {
    const options = FillerOptions.fromOptionValues({
      replay: true,
      continueWithFiller: true,
    });
    executeGetBlocksRangeUseCaseMock.mockResolvedValue(
      Result.withContent(BlocksRange.create(0, 100))
    );
    executePopulateBlockRangesUseCaseMock.mockResolvedValue(
      Result.withContent({ sent: 0, total: 0 })
    );
    executeShiftBlocksRangeUseCaseCaseMock.mockResolvedValue(
      Result.withContent(BlocksRange.create(0, 100))
    );
    executeSetupStateReceiverUseCaseCaseMock.mockResolvedValue(
      Result.withFailure(Failure.withMessage('StateReceiver Error'))
    );

    await commandHandler.run(options).catch(error => {
      expect(error).toBeInstanceOf(Error);
    });
  });
});
