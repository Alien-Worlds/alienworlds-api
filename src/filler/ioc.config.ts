/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { AbiRepositoryImpl } from '@common/abi/data/repositories/abi.repository-impl';
import { BlockRangeScanRepositoryImpl } from '@common/block-range-scan/data/block-range-scan.repository-impl';
import { BlockRangeScanMongoSource } from '@common/block-range-scan/data/data-sources/block-range-scan.mongo.source';
import { BlockRangeScan } from '@common/block-range-scan/domain/entities/block-range-scan';
import { BlockRangeScanRepository } from '@common/block-range-scan/domain/repositories/block-range-scan.repository';
import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { ActionProcessingQueueServiceImpl } from '@common/data-processing-queue/data/action-processing-queue.service-impl';
import { QueueName } from '@common/data-processing-queue/domain/data-processing-queue.enums';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { QueueActionProcessingUseCase } from '@common/data-processing-queue/domain/use-cases/queue-action-processing.use-case';
import { EosDacServiceImpl } from '@common/eos-dac/data/eos-dac.service-impl';
import { EosDacService } from '@common/eos-dac/domain/eos-dac.service';
import { MineMongoSource } from '@common/mines/data/data-sources/mine.mongo.source';
import { MineRepositoryImpl } from '@common/mines/data/mine.repository-impl';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { GetLastBlockUseCase } from '@common/mines/domain/use-cases/get-last-block.use-case';
import { WaxSource } from '@common/state-history/data/data-sources/wax.source';
import { StateHistoryServiceImpl } from '@common/state-history/data/state-history.service-impl';
import { GetBlocksResult } from '@common/state-history/domain/entities/get-blocks.result';
import { StateHistoryService } from '@common/state-history/domain/state-history.service';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';
import { config } from '@config';
import { MessagingAmqSource } from '@core/messaging/data/data-sources/messaging.amq.source';
import { MessageRepositoryImpl } from '@core/messaging/data/repositories/message.repository-impl';
import { connectMongo } from '@core/storage/data/data-sources/mongo.helpers';
import { MongoSource } from '@core/storage/data/data-sources/mongo.source';
import { AsyncContainerModule, Container } from 'inversify';
import { FillerOptions } from './domain/entities/filler-options';
import { FillerDefaultModeProcess } from './domain/processes/filler-default-mode.process';
import { FillerReplayModeProcess } from './domain/processes/filler-replay-mode.process';
import { FillerTestModeProcess } from './domain/processes/filler-test-mode.process';
import { CreateBlockRangeScanUseCase } from './domain/use-cases/create-block-range-scan.use-case';
import { GetBlockRangeUseCase } from './domain/use-cases/get-block-range.use-case';
import { GetLastIrreversableBlockNumUseCase } from './domain/use-cases/get-last-irreversable-block-number.use-case';
import { ProcessReceivedBlockUseCase } from './domain/use-cases/process-received-block.use-case';

const bindings = new AsyncContainerModule(async bind => {
  ////////////////////// CORE //////////////////////

  /**
   * MESSAGING
   */
  const messageAmqSource = new MessagingAmqSource(
    config.amqConnectionString,
    {
      prefetch: 1,
      queues: [
        {
          name: QueueName.Action,
          options: { durable: true },
        },
      ],
    },
    console
  );
  await messageAmqSource.init();

  /**
   * DATA PROCESSING QUEUE (rabbitMQ)
   */
  const actionProcessingQueueService = new ActionProcessingQueueServiceImpl(
    new MessageRepositoryImpl(messageAmqSource, QueueName.Action)
  );
  bind<ActionProcessingQueueService>(
    ActionProcessingQueueService.Token
  ).toConstantValue(actionProcessingQueueService);

  /**
   * MONGO DB (source & repositories)
   */
  const db = await connectMongo(config.mongo);
  const mongoSource = new MongoSource(db);
  bind<MineRepository>(MineRepository.Token).toConstantValue(
    new MineRepositoryImpl(new MineMongoSource(mongoSource))
  );
  bind<BlockRangeScanRepository>(
    BlockRangeScanRepository.Token
  ).toConstantValue(
    new BlockRangeScanRepositoryImpl(
      new BlockRangeScanMongoSource(mongoSource),
      config
    )
  );

  /**
   * STATE HISTORY PLUGIN
   */
  const waxSource = new WaxSource(config);
  const stateHistoryServiceImpl = new StateHistoryServiceImpl(
    waxSource,
    new AbiRepositoryImpl()
  );
  bind<StateHistoryService>(StateHistoryService.Token).toConstantValue(
    stateHistoryServiceImpl
  );

  /**
   * EOS DAC
   */
  bind<EosDacService>(EosDacService.Token).toConstantValue(
    new EosDacServiceImpl()
  );

  ////////////////////// LOGIC //////////////////////

  bind<FillerTestModeProcess>(FillerTestModeProcess.Token).to(
    FillerTestModeProcess
  );
  bind<FillerDefaultModeProcess>(FillerDefaultModeProcess.Token).to(
    FillerDefaultModeProcess
  );
  bind<GetLastBlockUseCase>(GetLastBlockUseCase.Token).to(GetLastBlockUseCase);
  bind<GetLastIrreversableBlockNumUseCase>(
    GetLastIrreversableBlockNumUseCase.Token
  ).to(GetLastIrreversableBlockNumUseCase);
  bind<GetBlockRangeUseCase>(GetBlockRangeUseCase.Token).to(
    GetBlockRangeUseCase
  );
  bind<RequestBlocksUseCase>(RequestBlocksUseCase.Token).to(
    RequestBlocksUseCase
  );
  bind<CreateBlockRangeScanUseCase>(CreateBlockRangeScanUseCase.Token).to(
    CreateBlockRangeScanUseCase
  );
  const queueActionProcessingUseCase = new QueueActionProcessingUseCase(
    actionProcessingQueueService
  );
  bind<QueueActionProcessingUseCase>(
    QueueActionProcessingUseCase.Token
  ).toConstantValue(queueActionProcessingUseCase);

  const processReceivedBlockUseCase = new ProcessReceivedBlockUseCase(
    queueActionProcessingUseCase
  );
  bind<ProcessReceivedBlockUseCase>(
    ProcessReceivedBlockUseCase.Token
  ).toConstantValue(processReceivedBlockUseCase);

  // Set State History plugin callbacks (onReceivedBlock && onComplete)

  stateHistoryServiceImpl.onReceivedBlock(
    async (content: GetBlocksResult, blockRange: BlockRange) => {
      await processReceivedBlockUseCase.execute(content, blockRange);
    }
  );

  stateHistoryServiceImpl.onBlockRangeComplete(
    async (blockRangeScan: BlockRangeScan) => {
      console.log(
        `Block Range complete ${blockRangeScan.start}-${blockRangeScan.end}`
      );
      process.exit(0);
    }
  );
  // How to handle errors?
  stateHistoryServiceImpl.onError(error => {
    console.log('State History Error: ', error);
  });
});

const replayBindings = new AsyncContainerModule(async bind => {
  ////////////////////// CORE //////////////////////

  /**
   * MONGO DB (source & repositories)
   */
  const db = await connectMongo(config.mongo);
  const mongoSource = new MongoSource(db);
  bind<MineRepository>(MineRepository.Token).toConstantValue(
    new MineRepositoryImpl(new MineMongoSource(mongoSource))
  );
  bind<BlockRangeScanRepository>(
    BlockRangeScanRepository.Token
  ).toConstantValue(
    new BlockRangeScanRepositoryImpl(
      new BlockRangeScanMongoSource(mongoSource),
      config
    )
  );

  /**
   * EOS DAC
   */
  bind<EosDacService>(EosDacService.Token).toConstantValue(
    new EosDacServiceImpl()
  );

  ////////////////////// LOGIC //////////////////////

  bind<FillerReplayModeProcess>(FillerReplayModeProcess.Token).to(
    FillerReplayModeProcess
  );
  bind<GetLastBlockUseCase>(GetLastBlockUseCase.Token).to(GetLastBlockUseCase);
  bind<GetLastIrreversableBlockNumUseCase>(
    GetLastIrreversableBlockNumUseCase.Token
  ).to(GetLastIrreversableBlockNumUseCase);
  bind<GetBlockRangeUseCase>(GetBlockRangeUseCase.Token).to(
    GetBlockRangeUseCase
  );
  bind<CreateBlockRangeScanUseCase>(CreateBlockRangeScanUseCase.Token).to(
    CreateBlockRangeScanUseCase
  );
});

export const fillerIoc = new Container();
export const setupIOC = async (options: FillerOptions) => {
  const { replay } = options;

  if (replay) {
    return fillerIoc.loadAsync(replayBindings);
  }

  await fillerIoc.loadAsync(bindings);
};
