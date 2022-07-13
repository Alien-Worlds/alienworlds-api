/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { FillerTestModeProcess } from '../filler-test-mode.process';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';

let container: Container;
const requestBlocksUseCase = { execute: jest.fn() };
let fillerProcess: FillerTestModeProcess;

describe('FillerTestModeProcess Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<RequestBlocksUseCase>(RequestBlocksUseCase.Token)
      .toConstantValue(requestBlocksUseCase as any);
    container
      .bind<FillerTestModeProcess>(FillerTestModeProcess.Token)
      .to(FillerTestModeProcess);
  });

  beforeEach(() => {
    fillerProcess = container.get<FillerTestModeProcess>(
      FillerTestModeProcess.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(FillerTestModeProcess.Token).not.toBeNull();
  });

  it('Should throw error if no block range was found', async () => {
    requestBlocksUseCase.execute.mockImplementation(() =>
      Result.withFailure(Failure.fromError(new Error()))
    );

    await fillerProcess
      .start({
        startBlock: 1n,
      } as any)
      .catch(error => {
        expect(requestBlocksUseCase.execute).toBeCalledWith(1n, 2n);
        expect(error).toBeInstanceOf(Error);
      });
  });
});
