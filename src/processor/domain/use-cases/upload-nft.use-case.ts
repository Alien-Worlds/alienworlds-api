import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { NFT } from '@common/nfts/domain/entities/nft';
import { NftRepository } from '@common/nfts/domain/repositories/nft.repository';
import { DataSourceOperationError } from '@core/architecture/data/errors/data-source-operation.error';
import { ActionProcessingJob } from '@common/data-processing-queue/domain/entities/action-processing.job';
import { ActionProcessingQueueService } from '@common/data-processing-queue/domain/services/action-processing-queue.service';
import { log } from '@common/state-history/domain/state-history.utils';
import { TemplateSmartContractRepository } from '@common/smart-contracts/domain/repositories/template-smart-contract.repository';
import { SchemaSmartContractRepository } from '@common/smart-contracts/domain/repositories/schema-smart-contract.repository';
import { DeserializeActionJobUseCase } from './deserialize-action-job.use-case';
import { NftMessageData } from '@common/nfts/data/nfts.dtos';
import { TemplateSmartContractData } from '@common/smart-contracts/domain/entities/template-smart-contract-data';
import { SchemaSmartContractData } from '@common/smart-contracts/domain/entities/schema-smart-contract-data';
import { config } from '@config';

/**
 * Uploading NFT
 *
 * @class
 */
@injectable()
export class UploadNftUseCase implements UseCase {
  public static Token = 'UPLOAD_NFT_USE_CASE';
  /**
   * @constructor
   */
  constructor(
    @inject(NftRepository.Token)
    private nftRepository: NftRepository,
    @inject(ActionProcessingQueueService.Token)
    private actionProcessingQueueService: ActionProcessingQueueService,
    @inject(TemplateSmartContractRepository.Token)
    private templateSmartContractRepository: TemplateSmartContractRepository,
    @inject(SchemaSmartContractRepository.Token)
    private schemaSmartContractRepository: SchemaSmartContractRepository,
    @inject(DeserializeActionJobUseCase.Token)
    private deserializeJobDataUseCase: DeserializeActionJobUseCase
  ) {}

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
      // Get template data
      const getTemplateResult =
        await this.templateSmartContractRepository.getData(
          deserializedData.template_id.toString(),
          collection
        );

      if (getTemplateResult.failure) {
        return Result.withFailure(getTemplateResult.failure);
      }

      template = getTemplateResult.content;
      // Get schema data
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
   * @async
   * @param {Message} job
   * @returns {Promise<Result>}
   */
  public async execute(job: ActionProcessingJob): Promise<Result<void>> {
    log(`Uploading NFT`);

    const { content: entity, failure: creationFailure } =
      await this.createNftEntity(job);

    if (creationFailure) {
      this.actionProcessingQueueService.rejectJob(job);
      return Result.withFailure(creationFailure);
    }

    const { failure: uploadFailure } = await this.nftRepository.add(entity);

    if (uploadFailure) {
      if (
        uploadFailure.error instanceof DataSourceOperationError &&
        uploadFailure.error.isDuplicateError
      ) {
        this.actionProcessingQueueService.ackJob(job);
      } else {
        this.actionProcessingQueueService.rejectJob(job);
      }
      return Result.withFailure(uploadFailure);
    }

    this.actionProcessingQueueService.ackJob(job);
    return Result.withoutContent();
  }
}
