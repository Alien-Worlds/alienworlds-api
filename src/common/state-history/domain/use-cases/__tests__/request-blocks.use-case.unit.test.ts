/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Failure } from '@core/architecture/domain/failure';
import { Container } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { StateHistoryServiceImpl } from '@common/state-history/data/state-history.service-impl';
import { StateHistoryService } from '../../state-history.service';
import { RequestBlocksUseCase } from '../request-blocks.use-case';

jest.mock('eosjs/dist/eosjs-serialize');

const stateHistoryService = {
  connect: jest.fn(),
  requestBlocks: jest.fn(() => {}),
} as any;

const stateHistoryServiceMock =
  stateHistoryService as jest.MockedObject<StateHistoryServiceImpl>;

let container: Container;
let useCase: RequestBlocksUseCase;

describe('RequestBlocksUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<StateHistoryService>(StateHistoryService.Token)
      .toConstantValue(stateHistoryService);
    container
      .bind<RequestBlocksUseCase>(RequestBlocksUseCase.Token)
      .to(RequestBlocksUseCase);
  });

  beforeEach(() => {
    useCase = container.get<RequestBlocksUseCase>(RequestBlocksUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(RequestBlocksUseCase.Token).not.toBeNull();
  });

  it('Should connect to state history plugin and send a request', async () => {
    stateHistoryService.connect = jest.fn(() => Result.withoutContent());
    stateHistoryService.requestBlocks = jest.fn(() => Result.withoutContent());

    const { failure } = await useCase.execute(0n, 1n);

    expect(stateHistoryServiceMock.connect).toBeCalled();
    expect(stateHistoryServiceMock.requestBlocks).toBeCalled();
    expect(failure).toBeUndefined();
  });

  it('Should return a failure ', async () => {
    stateHistoryService.connect = jest.fn(() =>
      Result.withFailure(Failure.fromError(new Error()))
    );

    const { content, failure } = await useCase.execute(0n, 1n);

    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);
  });
});
