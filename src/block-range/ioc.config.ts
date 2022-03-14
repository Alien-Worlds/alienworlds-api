/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { config } from '@config';
import { AmqMessages } from '@core/data/messages/amq.messages';
import { AsyncContainerModule, Container, interfaces } from 'inversify';
import { Messages } from '@core/domain/messages';
import { SetupStateReceiverUseCase } from './domain/use-cases/setup-state-receiver.use-case';
import {
  StateReceiver,
  StateReceiverFactory,
} from '@core/domain/state-receiver';
import { ProcessBlocksRangeMessageUseCase } from './domain/use-cases/process-blocks-range-message.use-case';

const StateReceiverImpl = require('@eosdacio/eosio-statereceiver');

const bindings = new AsyncContainerModule(async bind => {
  // Create and initialize messages service
  const messages = new AmqMessages(config.amqConnectionString, console);
  await messages.init();

  // Common/Core components
  bind<Messages>(Messages.Token).toConstantValue(messages);
  bind<interfaces.Factory<StateReceiver>>(
    StateReceiverFactory.Token
  ).toFactory<StateReceiver>((context: interfaces.Context) => {
    return (startBlock: bigint, endBlock: bigint, mode: number) => {
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

  // Block range components
  bind<SetupStateReceiverUseCase>(SetupStateReceiverUseCase.Token).to(
    SetupStateReceiverUseCase
  );

  bind<ProcessBlocksRangeMessageUseCase>(
    ProcessBlocksRangeMessageUseCase.Token
  ).to(ProcessBlocksRangeMessageUseCase);
});

export const ioc = new Container();
export const setupIOC = async () => ioc.loadAsync(bindings);
