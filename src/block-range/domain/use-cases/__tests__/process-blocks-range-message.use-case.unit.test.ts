/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { Container } from 'inversify';
import StateReceiverImpl from '@eosdacio/eosio-statereceiver';
import { Config, config } from '@config';
import { Failure } from '@core/domain/failure';
import { Messages } from '@core/domain/messages';
import { AmqMessages } from '@core/data/messages/amq.messages';
import { SetupStateReceiverUseCase } from '../setup-state-receiver.use-case';
import { ProcessBlocksRangeMessageUseCase } from '../process-blocks-range-message.use-case';
import { Result } from '@core/domain/result';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('@eosdacio/eosio-statereceiver');
jest.mock('@core/data/messages/amq.messages');
jest.mock('../setup-state-receiver.use-case');

let container: Container;
let useCase: ProcessBlocksRangeMessageUseCase;
const messages: AmqMessages = new AmqMessages(
  configMock.amqConnectionString,
  console
);

const setupStateReceiverUseCase = new SetupStateReceiverUseCase(null, null);
const setupStateReceiverUseCaseMock =
  setupStateReceiverUseCase as jest.MockedObject<SetupStateReceiverUseCase>;
const stateReceiver = new StateReceiverImpl();

describe('ProcessBlocksRangeMessageUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container.bind<Messages>(Messages.Token).toConstantValue(messages);
    container
      .bind<SetupStateReceiverUseCase>(SetupStateReceiverUseCase.Token)
      .toConstantValue(setupStateReceiverUseCase);
    container
      .bind<ProcessBlocksRangeMessageUseCase>(
        ProcessBlocksRangeMessageUseCase.Token
      )
      .to(ProcessBlocksRangeMessageUseCase);
  });

  beforeEach(() => {
    useCase = container.get<ProcessBlocksRangeMessageUseCase>(
      ProcessBlocksRangeMessageUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ProcessBlocksRangeMessageUseCase.Token).not.toBeNull();
  });

  it('Should return Failure when setupStateReceiverUseCase fails', async () => {
    setupStateReceiverUseCaseMock.execute.mockReturnValueOnce(
      Result.withFailure(Failure.withMessage('setup error'))
    );

    const { content, failure } = useCase.execute({} as any);

    expect(content).toBeUndefined();
    expect(failure).toBeInstanceOf(Failure);

    setupStateReceiverUseCaseMock.execute.mockReset();
  });

  it('Should start stateReceiver and return empty content when setupStateReceiverUseCase is successful and returns stateReceiver', async () => {
    setupStateReceiverUseCaseMock.execute.mockReturnValueOnce(
      Result.withContent(stateReceiver)
    );

    const { content, failure } = useCase.execute({} as any);

    const startMock = jest.spyOn(stateReceiver, 'start');

    expect(content).toBeUndefined();
    expect(failure).toBeUndefined();
    expect(startMock).toBeCalled();

    setupStateReceiverUseCaseMock.execute.mockReset();
    startMock.mockReset();
  });
});
