/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { config } from '@config';
import { EosDacRepositoryImpl } from '@common/eos-dac/data/eos-dac.repository-impl';
import { EosDacRepository } from '@common/eos-dac/domain/eos-dac.repository';
import { MinesMongoSource } from '@common/mines/data/data-sources/mines.mongo.source';
import { connectMongo } from '@core/data/data-sources/connect-mongo.helper';
import { AmqMessages } from '@core/data/messages/amq.messages';
import { MongoSource } from '@core/data/data-sources/mongo.source';
import { AsyncContainerModule, Container, interfaces } from 'inversify';
import { GetBlocksRangeUseCase } from './domain/use-cases/get-blocks-range.use-case';
import { GetLastIrreversableBlockNumUseCase } from './domain/use-cases/get-last-irreversable-block-number.use-case';
import { PopulateBlockRangesUseCase } from './domain/use-cases/populate-block-ranges.use-case';
import { FillerCommandHandler } from './domain/filler.command-handler';
import { Messages } from '@core/domain/messages';
import { SetupStateReceiverUseCase } from './domain/use-cases/setup-state-receiver.use-case';
import {
  StateReceiver,
  StateReceiverFactory,
} from '@core/domain/state-receiver';
import { ShiftBlocksRangeUseCase } from './domain/use-cases/shift-blocks-range.use-case';

const StateReceiverImpl = require('@eosdacio/eosio-statereceiver');

const bindings = new AsyncContainerModule(async bind => {
  // Connect to database
  const db = await connectMongo(config.mongo);

  // Create and initialize messages service
  const messages = new AmqMessages(config.amqConnectionString, console);
  await messages.init();

  // Common/Core components
  bind<Messages>(Messages.Token).toConstantValue(messages);
  bind<MongoSource>(MongoSource.Token).toConstantValue(new MongoSource(db));
  bind<MinesMongoSource>(MinesMongoSource.Token).to(MinesMongoSource);
  bind<EosDacRepositoryImpl>(EosDacRepository.Token).to(EosDacRepositoryImpl);
  bind<interfaces.Factory<StateReceiver>>(StateReceiverFactory.Token).toFactory<
    StateReceiver,
    [0, 0, 0]
  >((context: interfaces.Context) => {
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

  // Filler components
  bind<FillerCommandHandler>(FillerCommandHandler.Token).to(
    FillerCommandHandler
  );

  bind<GetLastIrreversableBlockNumUseCase>(
    GetLastIrreversableBlockNumUseCase.Token
  ).to(GetLastIrreversableBlockNumUseCase);

  bind<GetBlocksRangeUseCase>(GetBlocksRangeUseCase.Token).to(
    GetBlocksRangeUseCase
  );

  bind<PopulateBlockRangesUseCase>(PopulateBlockRangesUseCase.Token).to(
    PopulateBlockRangesUseCase
  );

  bind<SetupStateReceiverUseCase>(SetupStateReceiverUseCase.Token).to(
    SetupStateReceiverUseCase
  );

  bind<ShiftBlocksRangeUseCase>(ShiftBlocksRangeUseCase.Token).to(
    ShiftBlocksRangeUseCase
  );
});

export const ioc = new Container();
export const setupIOC = async () => ioc.loadAsync(bindings);
