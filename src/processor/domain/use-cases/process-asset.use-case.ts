import { Asset, AssetData } from '@common/assets/domain/entities/asset';
import { AssetRepository } from '@common/assets/domain/repositories/asset.repository';
import { AtomicTransferRepository } from '@common/atomic-transfers/domain/repositories/atomic-transfer.repository';
import { SmartContractDataNotFoundError } from '@common/smart-contracts/domain/errors/smart-contract-data-not-found.error';
import { AssetSmartContractRepository } from '@common/smart-contracts/domain/repositories/asset-smart-contract.repository';
import { SchemaSmartContractRepository } from '@common/smart-contracts/domain/repositories/schema-smart-contract.repository';
import { TemplateSmartContractRepository } from '@common/smart-contracts/domain/repositories/template-smart-contract.repository';
import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { AssetProcessingJob } from '@common/data-processing-queue/domain/entities/asset-processing.job';
import { AssetProcessingQueueService } from '@common/data-processing-queue/domain/services/asset-processing-queue.service';

/**
 * Update asset owner or create a new asset based on data retrieved from
 * smart contract tables: assets, templates, schemas.
 *
 * @class
 */
@injectable()
export class ProcessAssetUseCase implements UseCase {
  public static Token = 'PROCESS_ASSET_USE_CASE';

  constructor(
    @inject(AssetProcessingQueueService.Token)
    private assetProcessingQueueService: AssetProcessingQueueService,
    @inject(AssetRepository.Token)
    private assetRepository: AssetRepository,
    @inject(AtomicTransferRepository.Token)
    private atomicTransferRepository: AtomicTransferRepository,
    @inject(AssetSmartContractRepository.Token)
    private assetSmartContractRepository: AssetSmartContractRepository,
    @inject(TemplateSmartContractRepository.Token)
    private templateSmartContractRepository: TemplateSmartContractRepository,
    @inject(SchemaSmartContractRepository.Token)
    private schemaSmartContractRepository: SchemaSmartContractRepository
  ) {}

  /**
   * Create asset entity based on data retrieved from
   * smart contract tables.
   *
   * @async
   * @private
   * @param {number} assetId
   * @param {string} owner
   * @returns {Asset}
   */
  private async createAssetFromSmartContractsData(
    assetId: bigint,
    owner: string
  ): Promise<Result<Asset>> {
    // Get asset data
    const { content: asset, failure: getAssetFailure } =
      await this.assetSmartContractRepository.getData(
        assetId.toString(),
        owner
      );

    if (getAssetFailure) {
      return Result.withFailure(getAssetFailure);
    }

    const { collectionName, templateId } = asset;
    // Get template data
    const { content: template, failure: getTemplateFailure } =
      await this.templateSmartContractRepository.getData(
        templateId.toString(),
        collectionName
      );

    if (getTemplateFailure) {
      return Result.withFailure(getTemplateFailure);
    }
    // Get schema data
    const { content: schema, failure: getSchemaFailure } =
      await this.schemaSmartContractRepository.getData(
        template.schemaName,
        collectionName
      );

    if (getSchemaFailure) {
      return Result.withFailure(getSchemaFailure);
    }
    // Combine all data to build AssetData entity
    const assetData = AssetData.fromSmartContractsData(asset, template, schema);
    // Return Asset entity created based on the above data
    return Result.withContent(Asset.create(assetId, owner, assetData));
  }

  /**
   * @async
   * @param {AssetProcessingJob} job
   * @returns {Result<void>}
   */
  public async execute(job: AssetProcessingJob): Promise<Result<void>> {
    const { assetId } = job;
    let failure: Failure;

    // Get transfer data
    const { content: transfer, failure: getTransferFailure } =
      await this.atomicTransferRepository.getByAssetId(assetId);

    if (getTransferFailure) {
      //
      return Result.withFailure(getTransferFailure);
    }
    // Try to find asset with a matching assetId
    const getAssetResult = await this.assetRepository.getByAssetId(assetId);

    if (getAssetResult.isFailure) {
      // If the resource with the specified assetId is not found, it must be
      // created and added to the data source.
      const createAssetResult = await this.createAssetFromSmartContractsData(
        assetId,
        transfer.to
      );

      if (createAssetResult.isFailure) {
        // Set a failure for later handling
        failure = createAssetResult.failure;
      } else {
        const insertResult = await this.assetRepository.add(
          createAssetResult.content
        );
        // If the insertion failed, set the failure for later handling
        failure = insertResult.failure;
      }
    } else {
      // If asset is found, update "owner" and send it back to data source.
      const assetDto = getAssetResult.content.toDto({ owner: transfer.to });
      const updateResult = await this.assetRepository.update(
        Asset.fromDto(assetDto)
      );
      // If the update was unsuccessful, set the failure for later handling
      failure = updateResult.failure;
    }

    // Handle the failure
    if (failure) {
      // when createAssetFromSmartContractsData fails due to not found data
      if (failure.error instanceof SmartContractDataNotFoundError) {
        this.assetProcessingQueueService.ackJob(job);
      } else {
        this.assetProcessingQueueService.rejectJob(job);
      }
      return Result.withFailure(failure);
    }

    // Ack job when processing is successful
    this.assetProcessingQueueService.ackJob(job);
    return Result.withoutContent();
  }
}
