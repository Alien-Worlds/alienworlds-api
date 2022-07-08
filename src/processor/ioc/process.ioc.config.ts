/* eslint-disable @typescript-eslint/no-unused-vars */

import fetch from 'node-fetch';
import { config } from '@config';
import { AsyncContainerModule, Container } from 'inversify';
import { StateHistoryServiceImpl } from '@common/state-history/data/state-history.service-impl';
import { AbiRepositoryImpl } from '@common/abi/data/repositories/abi.repository-impl';
import { StateHistoryService } from '@common/state-history/domain/state-history.service';
import { AbiRepository } from '@common/abi/domain/abi.repository';
import { WaxSource } from '@common/state-history/data/data-sources/wax.source';
import { MessagingAmqSource } from '@core/messaging/data/data-sources/messaging.amq.source';
import { connectMongo } from '@core/storage/data-sources/connect-mongo.helper';
import { MongoSource } from '@core/storage/data-sources/mongo.source';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { ActionProcessingQueueServiceImpl } from '@common/data-processing-queue/data/action-processing-queue.service-impl';
import { MessageRepositoryImpl } from '@core/messaging/data/repositories/message.repository-impl';
import { QueueName } from '@common/data-processing-queue/domain/data-processing-queue.enums';
import { MineRepository } from '@common/mines/domain/mine.repository';
import { MineRepositoryImpl } from '@common/mines/data/mine.repository-impl';
import { MineMongoSource } from '@common/mines/data/data-sources/mine.mongo.source';
import { NftRepository } from '@common/nfts/domain/repositories/nft.repository';
import { NftRepositoryImpl } from '@common/nfts/data/repositories/nft.repository-impl';
import { NftMongoSource } from '@common/nfts/data/data-sources/nft.mongo.source';
import { AtomicTransferRepository } from '@common/atomic-transfers/domain/repositories/atomic-transfer.repository';
import { AtomicTransferRepositoryImpl } from '@common/atomic-transfers/data/repositories/atomic-transfer.repository-impl';
import { AtomicTransferMongoSource } from '@common/atomic-transfers/data/data-sources/atomic-transfer.mongo.source';
import { AssetRepository } from '@common/assets/domain/repositories/asset.repository';
import { AssetRepositoryImpl } from '@common/assets/data/repositories/asset.repository-impl';
import { AssetMongoSource } from '@common/assets/data/data-sources/asset.mongo.source';
import { JsonRpc } from 'eosjs';
import { GetTableRowsOptions } from '@core/rpc/data/data-sources/eos-rpc.source';
import { AbiEosService } from '@common/abi/data/services/abieos.service';
import { AbiHexRepositoryImpl } from '../data/repositories/abi-hex.repository-impl';
import { TemplateSmartContractRepository } from '@common/smart-contracts/domain/repositories/template-smart-contract.repository';
import { TemplateSmartContractRepositoryImpl } from '@common/smart-contracts/data/repositories/template-smart-contract.repository-impl';
import { SchemaSmartContractRepository } from '@common/smart-contracts/domain/repositories/schema-smart-contract.repository';
import { SchemaSmartContractRepositoryImpl } from '@common/smart-contracts/data/repositories/schema-smart-contract.repository-impl';
import { AssetSmartContractRepository } from '@common/smart-contracts/domain/repositories/asset-smart-contract.repository';
import { AssetSmartContractRepositoryImpl } from '@common/smart-contracts/data/repositories/asset-smart-contract.repository-impl';
import { GetMostRecentAbiHexUseCase } from '../domain/use-cases/get-most-recent-abi-hex.use-case';
import { ParseDataToJsonUseCase } from '@common/abi/domain/use-cases/parse-data-to-json.use-case';
import { DeserializeActionJobUseCase } from '../domain/use-cases/deserialize-action-job.use-case';
import { ProcessActionUseCase } from '../domain/use-cases/process-action.use-case';
import { ProcessAssetUseCase } from '../domain/use-cases/process-asset.use-case';
import { CreateEntityFromActionUseCase } from '../domain/use-cases/create-entity-from-action.use-case';
import { AbiHexRepository } from '../domain/abi-hex.repository';
import { AssetProcessingQueueService } from '@common/data-processing-queue/domain/services/asset-processing-queue.service';
import { AssetProcessingQueueServiceImpl } from '@common/data-processing-queue/data/asset-processing-queue.service-impl';
import { ProcessorProcess } from '../domain/processor.process';
import { QueueAssetProcessingUseCase } from '@common/data-processing-queue/domain/use-cases/queue-asset-processing.use-case';
import { AbiHexFile } from '../data/abi-hex.dto';
import { UploadAbiHexUseCase } from '../domain/use-cases/upload-abi-hex.use-case';
import { AbiHexLocalSource } from '../data/data-sources/abi-hex.local.source';

const bindings = new AsyncContainerModule(async bind => {
  ////////////////////// CORE //////////////////////
  /**
   * EOS RPC
   */
  const eosRpcSourceProvider = (rpc: JsonRpc) => ({
    getTableRows: (options: GetTableRowsOptions) => rpc.get_table_rows(options),
  });
  const rpc: JsonRpc = new JsonRpc(config.endpoints[0], { fetch });
  const eosRpcSource = eosRpcSourceProvider(rpc);

  /**
   * SMART CONTRACTS
   */
  bind<TemplateSmartContractRepository>(
    TemplateSmartContractRepository.Token
  ).toConstantValue(new TemplateSmartContractRepositoryImpl(eosRpcSource));
  bind<SchemaSmartContractRepository>(
    SchemaSmartContractRepository.Token
  ).toConstantValue(new SchemaSmartContractRepositoryImpl(eosRpcSource));
  bind<AssetSmartContractRepository>(
    AssetSmartContractRepository.Token
  ).toConstantValue(new AssetSmartContractRepositoryImpl(eosRpcSource));

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
        {
          name: QueueName.RecalcAsset,
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
  const actionProcessingQueueServiceImpl = new ActionProcessingQueueServiceImpl(
    new MessageRepositoryImpl(messageAmqSource, QueueName.Action)
  );
  const assetProcessingQueueServiceImpl = new AssetProcessingQueueServiceImpl(
    new MessageRepositoryImpl(messageAmqSource, QueueName.RecalcAsset)
  );
  bind<ActionProcessingQueueService>(
    ActionProcessingQueueService.Token
  ).toConstantValue(actionProcessingQueueServiceImpl);
  bind<AssetProcessingQueueService>(
    AssetProcessingQueueService.Token
  ).toConstantValue(assetProcessingQueueServiceImpl);

  /**
   * ABI & ABI *.hex files
   */
  const abiRepository = new AbiRepositoryImpl();
  const abiLocalSource = new AbiHexLocalSource();
  const abiEosService = new AbiEosService();
  const abiHexRepository = new AbiHexRepositoryImpl(
    abiLocalSource,
    abiEosService
  );
  bind<AbiEosService>(AbiEosService.Token).toConstantValue(abiEosService);
  bind<AbiRepository>(AbiRepository.Token).toConstantValue(abiRepository);
  bind<AbiHexRepository>(AbiHexRepository.Token).toConstantValue(
    abiHexRepository
  );

  /**
   * STATE HISTORY PLUGIN
   */
  const waxSource = new WaxSource(config);
  const stateHistoryServiceImpl = new StateHistoryServiceImpl(
    waxSource,
    abiRepository
  );
  bind<StateHistoryService>(StateHistoryService.Token).toConstantValue(
    stateHistoryServiceImpl
  );

  /**
   * MONGO DB (source & repositories)
   */
  const db = await connectMongo(config.mongo);
  const mongoSource = new MongoSource(db);

  bind<MineRepository>(MineRepository.Token).toConstantValue(
    new MineRepositoryImpl(new MineMongoSource(mongoSource))
  );
  bind<NftRepository>(NftRepository.Token).toConstantValue(
    new NftRepositoryImpl(new NftMongoSource(mongoSource))
  );
  bind<AtomicTransferRepository>(
    AtomicTransferRepository.Token
  ).toConstantValue(
    new AtomicTransferRepositoryImpl(new AtomicTransferMongoSource(mongoSource))
  );
  bind<AssetRepository>(AssetRepository.Token).toConstantValue(
    new AssetRepositoryImpl(new AssetMongoSource(mongoSource))
  );

  /**
   * PROCESS
   */
  bind<ProcessorProcess>(ProcessorProcess.Token).to(ProcessorProcess);

  ////////////////////// LOGIC //////////////////////

  bind<QueueAssetProcessingUseCase>(QueueAssetProcessingUseCase.Token).to(
    QueueAssetProcessingUseCase
  );

  bind<GetMostRecentAbiHexUseCase>(GetMostRecentAbiHexUseCase.Token).to(
    GetMostRecentAbiHexUseCase
  );
  bind<UploadAbiHexUseCase>(UploadAbiHexUseCase.Token).to(UploadAbiHexUseCase);
  bind<ParseDataToJsonUseCase>(ParseDataToJsonUseCase.Token).to(
    ParseDataToJsonUseCase
  );
  bind<DeserializeActionJobUseCase>(DeserializeActionJobUseCase.Token).to(
    DeserializeActionJobUseCase
  );
  bind<ProcessActionUseCase>(ProcessActionUseCase.Token).to(
    ProcessActionUseCase
  );
  bind<ProcessAssetUseCase>(ProcessAssetUseCase.Token).to(ProcessAssetUseCase);
  bind<CreateEntityFromActionUseCase>(CreateEntityFromActionUseCase.Token).to(
    CreateEntityFromActionUseCase
  );
});

export const processIoc = new Container();
export const setupProcessIoc = async (data: AbiHexFile[]) => {
  await processIoc.loadAsync(bindings);

  const repository = processIoc.get<AbiHexRepository>(AbiHexRepository.Token);
  await repository.load(data);
};
