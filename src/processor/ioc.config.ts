/* eslint-disable @typescript-eslint/no-unused-vars */

import StateReceiverImpl from '@eosdacio/eosio-statereceiver';
import { config } from '@config';
import { AmqMessages } from '@core/data/messages/amq.messages';
import { AsyncContainerModule, Container, interfaces } from 'inversify';
import { Messages } from '@core/domain/messages';
import {
  StateReceiver,
  StateReceiverFactory,
} from '@core/domain/state-receiver';
import { ProcessorCommandHandler } from './domain/processor.command-handler';
import { connectMongo } from '@core/data/data-sources/connect-mongo.helper';
import { MongoSource } from '@core/data/data-sources/mongo.source';

const bindings = new AsyncContainerModule(async bind => {
  // Create and initialize messages service
  const messages = new AmqMessages(config.amqConnectionString, console);
  await messages.init();

  // Connect to database
  const db = await connectMongo(config.mongo);

  // Common/Core components
  bind<Messages>(Messages.Token).toConstantValue(messages);
  bind<MongoSource>(MongoSource.Token).toConstantValue(new MongoSource(db));
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

  bind<ProcessorCommandHandler>(ProcessorCommandHandler.Token).to(
    ProcessorCommandHandler
  );
});

export const ioc = new Container();
export const setupIOC = async () => ioc.loadAsync(bindings);
