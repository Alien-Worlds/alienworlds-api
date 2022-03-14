/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';
import { Container, interfaces } from 'inversify';
import { SetupStateReceiverUseCase } from '../setup-state-receiver.use-case';
import { AmqMessages } from '@core/data/messages/amq.messages';
import { Messages } from '@core/domain/messages';
import {
  StateReceiver,
  StateReceiverFactory,
} from '@core/domain/state-receiver';
import { Config, config } from '@config';
import { BlocksRange } from '@common/block/domain/entities/blocks-range';
import StateReceiverImpl from '@eosdacio/eosio-statereceiver';

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('@eosdacio/eosio-statereceiver');
jest.mock('@core/data/messages/amq.messages');
jest.mock('../../../../handlers/trace-handler');
jest.mock('../../../../include/statsdisplay');

let container: Container;
let useCase: SetupStateReceiverUseCase;
const messages: AmqMessages = new AmqMessages(
  configMock.amqConnectionString,
  console
);
const stateReceiver = new StateReceiverImpl();

describe('SetupStateReceiverUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<interfaces.Factory<StateReceiver>>(StateReceiverFactory.Token)
      .toFactory<StateReceiver>(() => {
        return () => stateReceiver;
      });
    container.bind<Messages>(Messages.Token).toConstantValue(messages);
    container
      .bind<SetupStateReceiverUseCase>(SetupStateReceiverUseCase.Token)
      .to(SetupStateReceiverUseCase);
  });

  beforeEach(() => {
    useCase = container.get<SetupStateReceiverUseCase>(
      SetupStateReceiverUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(SetupStateReceiverUseCase.Token).not.toBeNull();
  });

  it('Should return a Result object with the StateReceiver instance', async () => {
    const blockRange = { start: 0n, end: 100n };
    const fromMessageMock = jest
      .spyOn(BlocksRange, 'fromMessage')
      .mockReturnValueOnce(blockRange);
    const result = await useCase.execute({} as any);

    expect(result.content).toBeInstanceOf(StateReceiverImpl);
    expect(result.failure).toBeUndefined();

    fromMessageMock.mockReset();
  });

  it('Should call stateReceiver handlers', async () => {
    const blockRange = { start: 0n, end: 100n };
    const fromMessageMock = jest
      .spyOn(BlocksRange, 'fromMessage')
      .mockReturnValueOnce(blockRange);
    const registerTraceHandlerMock = jest.spyOn(
      stateReceiver,
      'registerTraceHandler'
    );
    const registerDoneHandlerMock = jest.spyOn(
      stateReceiver,
      'registerDoneHandler'
    );
    await useCase.execute({} as any);

    expect(registerTraceHandlerMock).toBeCalled();
    expect(registerDoneHandlerMock).toBeCalled();

    fromMessageMock.mockReset();
    registerTraceHandlerMock.mockReset();
    registerDoneHandlerMock.mockReset();
  });
});
