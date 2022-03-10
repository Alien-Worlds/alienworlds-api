/* eslint-disable @typescript-eslint/no-var-requires */

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
import { BlocksRange } from '../../entities/blocks-range';

const StateReceiverImpl = require('@eosdacio/eosio-statereceiver');

jest.mock('@config');
const configMock = config as jest.MockedObject<Config>;

jest.mock('../../../../handlers/trace-handler');
jest.mock('../../../../include/statsdisplay');
jest.mock('@core/data/messages/amq.messages');
jest.mock('@eosdacio/eosio-statereceiver');

let container: Container;
let useCase: SetupStateReceiverUseCase;
const messages: AmqMessages = new AmqMessages(
  configMock.amqConnectionString,
  console
);

describe('SetupStateReceiverUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<interfaces.Factory<StateReceiver>>(StateReceiverFactory.Token)
      .toFactory<StateReceiver, [0, 0, 0]>(() => {
        return (startBlock: number, endBlock: number, mode: number) => {
          return new StateReceiverImpl({
            startBlock,
            endBlock,
            mode,
            config: {
              eos: {
                wsEndpoint: config.shipEndpoints[0],
                chainId: config.chainId,
                endpoint: config.endpoints[0],
              },
            },
          });
        };
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
    const result = await useCase.execute(BlocksRange.create(0, 100));
    expect(result.content).toBeInstanceOf(StateReceiverImpl);
    expect(result.failure).toBeUndefined();
  });
});
