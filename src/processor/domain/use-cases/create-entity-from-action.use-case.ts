import { CollectionMismatchError } from '../errors/collection-mismatch.error';
import { AtomicTransfer } from '@common/atomic-transfers/domain/entities/atomic-transfer';
import { MineMessageData } from '@common/mines/data/mines.dtos';
import { Mine } from '@common/mines/domain/entities/mine';
import { NftMessageData } from '@common/nfts/data/nfts.dtos';
import { NFT } from '@common/nfts/domain/entities/nft';
import { SchemaSmartContractData } from '@common/smart-contracts/domain/entities/schema-smart-contract-data';
import { TemplateSmartContractData } from '@common/smart-contracts/domain/entities/template-smart-contract-data';
import { SchemaSmartContractRepository } from '@common/smart-contracts/domain/repositories/schema-smart-contract.repository';
import { TemplateSmartContractRepository } from '@common/smart-contracts/domain/repositories/template-smart-contract.repository';
import { config } from '@config';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { AtomicTransferMessageData } from '@common/atomic-transfers/data/atomic-transfers.dtos';
import { UnknownActionTypeError } from '../errors/unknown-action-type.error';
import { ActionName } from '@common/actions/domain/actions.enums';
import { ActionProcessingJob } from '@common/data-processing-queue/domain/entities/action-processing.job';
import { DeserializeActionJobUseCase } from './deserialize-action-job.use-case';

/**
 * Represents a use case which creates and returns an entity object, Based on the
 * given action job and further external data these may be:
 * - Mine
 * - NFT
 * - AtomicTransfer
 *
 * @class
 */
@injectable()
export class CreateEntityFromActionUseCase
  implements UseCase<Mine | NFT | AtomicTransfer>
{
  public static Token = 'CREATE_ENTITY_FROM_MESSAGE_USE_CASE';

  /**
   * @constructor
   */
  constructor(
    @inject(DeserializeActionJobUseCase.Token)
    private deserializeJobDataUseCase: DeserializeActionJobUseCase,
    @inject(TemplateSmartContractRepository.Token)
    private templateSmartContractRepository: TemplateSmartContractRepository,
    @inject(SchemaSmartContractRepository.Token)
    private schemaSmartContractRepository: SchemaSmartContractRepository
  ) {}

  /**
   * Create mine entity
   *
   * @private
   * @param {ActionProcessingJob} job
   * @returns {Result<Mine>}
   */
  private createMineEntity(job: ActionProcessingJob): Result<Mine> {
    const { content: data, failure: deserializationFailure } =
      this.deserializeJobDataUseCase.execute<MineMessageData>(job);

    if (deserializationFailure) {
      return Result.withFailure(deserializationFailure);
    }

    return Result.withContent(Mine.fromMessage(job, data));
  }

  /**
   * Create NFT entity
   *
   * @private
   * @async
   * @param {ActionProcessingJob} action
   * @returns {Promise<Result<NFT>>}
   */
  private async createNftEntity(
    message: ActionProcessingJob
  ): Promise<Result<NFT>> {
    const { content: deserializedData, failure: deserializationFailure } =
      this.deserializeJobDataUseCase.execute<NftMessageData>(message);

    if (deserializationFailure) {
      return Result.withFailure(deserializationFailure);
    }

    let template: TemplateSmartContractData;
    let schema: SchemaSmartContractData;

    // Since template data is optional, first check that the templateId is valid
    // and try to get the corresponding template.
    if (deserializedData.template_id > 0) {
      const {
        atomicAssets: { collection },
      } = config;
      const getTemplateResult =
        await this.templateSmartContractRepository.getData(
          deserializedData.template_id.toString(),
          collection
        );
      if (getTemplateResult.failure) {
        return Result.withFailure(getTemplateResult.failure);
      }
      template = getTemplateResult.content;

      const getSchemaResult = await this.schemaSmartContractRepository.getData(
        template.schemaName,
        collection
      );

      if (getSchemaResult.failure) {
        return Result.withFailure(getSchemaResult.failure);
      }

      schema = getSchemaResult.content;
    }

    return Result.withContent(
      NFT.fromMessage(message, deserializedData, template, schema)
    );
  }

  /**
   * Create AtomicTransfer entity
   *
   * @private
   * @param {ActionProcessingJob} job
   * @returns {Result<AtomicTransfer>}
   */
  private createAtomicTransferEntity(
    job: ActionProcessingJob
  ): Result<AtomicTransfer> {
    const {
      atomicAssets: { collection },
    } = config;
    const { content: deserializedData, failure: deserializationFailure } =
      this.deserializeJobDataUseCase.execute<AtomicTransferMessageData>(job);

    if (deserializationFailure) {
      return Result.withFailure(deserializationFailure);
    }

    // If the collection name is different from the one set in the config,
    // skip this message and terminate operation with a failure that
    // will be handled later
    if (deserializedData.collection_name !== collection) {
      return Result.withFailure(
        Failure.fromError(
          new CollectionMismatchError(
            deserializedData.collection_name,
            collection
          )
        )
      );
    }
    return Result.withContent(
      AtomicTransfer.fromMessage(job, deserializedData)
    );
  }

  /**
   * Create entity based on action type or return a failure with
   * UnknownActionTypeError
   *
   * @async
   * @param {ActionProcessingJob} job
   * @returns {Promise<Result<Mine | NFT | AtomicTransfer>>}
   */
  public async execute(
    job: ActionProcessingJob
  ): Promise<Result<Mine | NFT | AtomicTransfer>> {
    const actionLabel = `${job.account}::${job.name}`;
    const {
      atomicAssets: { contract },
    } = config;

    if (actionLabel === `m.federation::${ActionName.LogMine}`) {
      return this.createMineEntity(job);
    }

    if (actionLabel === `m.federation::${ActionName.LogRand}`) {
      return this.createNftEntity(job);
    }

    if (
      actionLabel === `${contract}::${ActionName.LogTransfer}` ||
      actionLabel === `${contract}::${ActionName.LogMint}` ||
      actionLabel === `${contract}::${ActionName.LogBurn}`
    ) {
      return this.createAtomicTransferEntity(job);
    }

    return Result.withFailure(
      Failure.fromError(new UnknownActionTypeError(actionLabel))
    );
  }
}
