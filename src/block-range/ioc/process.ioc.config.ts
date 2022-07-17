/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { config } from '@config';
import { AsyncContainerModule, Container } from 'inversify';
import { StateHistoryServiceImpl } from '@common/state-history/data/state-history.service-impl';
import { AbiRepositoryImpl } from '@common/abi/data/repositories/abi.repository-impl';
import { ProcessReceivedBlockUseCase } from '../domain/use-cases/process-received-block.use-case';
import { StateHistoryService } from '@common/state-history/domain/state-history.service';
import { AbiRepository } from '@common/abi/domain/abi.repository';
import { CompleteBlockRangeScanUseCase } from '../domain/use-cases/complete-block-range-scan.use-case';
import { WaxSource } from '@common/state-history/data/data-sources/wax.source';
import { MessagingAmqSource } from '@core/messaging/data/data-sources/messaging.amq.source';
import { GetCurrentAbiUseCase } from '@common/abi/domain/use-cases/get-current-abi.use-case';
import { BlockRangeScanMongoSource } from '@common/block-range-scan/data/data-sources/block-range-scan.mongo.source';
import { BlockRangeScanRepository } from '@common/block-range-scan/domain/repositories/block-range-scan.repository';
import { BlockRangeScanRepositoryImpl } from '@common/block-range-scan/data/block-range-scan.repository-impl';
import { connectMongo } from '@core/storage/data/data-sources/connect-mongo.helper';
import { MongoSource } from '@core/storage/data/data-sources/mongo.source';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { ActionProcessingQueueServiceImpl } from '@common/data-processing-queue/data/action-processing-queue.service-impl';
import { MessageRepositoryImpl } from '@core/messaging/data/repositories/message.repository-impl';
import { QueueName } from '@common/data-processing-queue/domain/data-processing-queue.enums';
import { BlockRangeProcess } from '../domain/block-range.process';
import { RequestBlocksUseCase } from '@common/state-history/domain/use-cases/request-blocks.use-case';
import { QueueActionProcessingUseCase } from '@common/data-processing-queue/domain/use-cases/queue-action-processing.use-case';
import { GetBlocksResult } from '@common/state-history/domain/entities/get-blocks.result';
import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { BlockRangeScan } from '@common/block-range-scan/domain/entities/block-range-scan';
import { StartNextScanUseCase } from '@common/block-range-scan/domain/use-cases/start-next-scan.use-case';
import { VerifyUnscannedBlockRangeUseCase } from '../domain/use-cases/verify-unscanned-block-range.use-case';
import { StartBlockRangeScanUseCase } from '../domain/use-cases/start-block-range-scan.use-case';

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
  const messageRepository = new MessageRepositoryImpl(
    messageAmqSource,
    QueueName.Action
  );

  /**
   * DATA PROCESSING QUEUE (rabbitMQ)
   */
  bind<ActionProcessingQueueService>(
    ActionProcessingQueueService.Token
  ).toConstantValue(new ActionProcessingQueueServiceImpl(messageRepository));

  /**
   * ABI
   */
  const abiRepositoryImpl = new AbiRepositoryImpl();
  bind<AbiRepository>(AbiRepository.Token).toConstantValue(abiRepositoryImpl);

  /**
   * STATE HISTORY PLUGIN
   */
  const waxSource = new WaxSource(config);
  const stateHistoryServiceImpl = new StateHistoryServiceImpl(
    waxSource,
    abiRepositoryImpl
  );
  bind<StateHistoryService>(StateHistoryService.Token).toConstantValue(
    stateHistoryServiceImpl
  );

  /**
   * MONGO DB (source & repositories)
   */
  const db = await connectMongo(config.mongo);
  const mongoSource = new MongoSource(db);
  const blockRangeScanRepository = new BlockRangeScanRepositoryImpl(
    new BlockRangeScanMongoSource(mongoSource),
    config
  );
  bind<BlockRangeScanRepository>(
    BlockRangeScanRepository.Token
  ).toConstantValue(blockRangeScanRepository);

  /**
   * PROCESS
   */
  bind<BlockRangeProcess>(BlockRangeProcess.Token).to(BlockRangeProcess);

  ////////////////////// LOGIC //////////////////////

  bind<StartNextScanUseCase>(StartNextScanUseCase.Token).to(
    StartNextScanUseCase
  );
  bind<RequestBlocksUseCase>(RequestBlocksUseCase.Token).to(
    RequestBlocksUseCase
  );
  bind<QueueActionProcessingUseCase>(QueueActionProcessingUseCase.Token).to(
    QueueActionProcessingUseCase
  );
  bind<VerifyUnscannedBlockRangeUseCase>(
    VerifyUnscannedBlockRangeUseCase.Token
  ).to(VerifyUnscannedBlockRangeUseCase);
  bind<StartBlockRangeScanUseCase>(StartBlockRangeScanUseCase.Token).to(
    StartBlockRangeScanUseCase
  );
  bind<CompleteBlockRangeScanUseCase>(CompleteBlockRangeScanUseCase.Token).to(
    CompleteBlockRangeScanUseCase
  );
  bind<GetCurrentAbiUseCase>(GetCurrentAbiUseCase.Token).to(
    GetCurrentAbiUseCase
  );
  bind<ProcessReceivedBlockUseCase>(ProcessReceivedBlockUseCase.Token).to(
    ProcessReceivedBlockUseCase
  );
});

export const processIoc = new Container();
export const setupProcessIoc = async (scanKey: string) => {
  await processIoc.loadAsync(bindings);

  // Set State History plugin callbacks (onReceivedBlock && onComplete)

  const stateHistoryService = processIoc.get<StateHistoryService>(
    StateHistoryService.Token
  );
  const processReceivedBlockUseCase =
    processIoc.get<ProcessReceivedBlockUseCase>(
      ProcessReceivedBlockUseCase.Token
    );
  const completeBlockRangeScanUseCase =
    processIoc.get<CompleteBlockRangeScanUseCase>(
      CompleteBlockRangeScanUseCase.Token
    );

  stateHistoryService.onReceivedBlock(
    async (content: GetBlocksResult, blockRange: BlockRange) => {
      await processReceivedBlockUseCase.execute(scanKey, content, blockRange);
    }
  );

  stateHistoryService.onBlockRangeComplete(
    async (blockRangeScan: BlockRangeScan) => {
      await completeBlockRangeScanUseCase.execute(blockRangeScan);
    }
  );
};
