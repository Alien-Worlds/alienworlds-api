import { inject, injectable } from 'inversify';
import { ListAssetsInput } from '../models/list-assets.input';
import { ListAssetsQueryModel } from '../models/list-assets.query-model';
import { Result, UseCase } from '@alien-worlds/api-core';
import { Asset, AssetRepository } from '@alien-worlds/alienworlds-api-common';

/**
 * @class
 */
@injectable()
export class ListAssetsUseCase implements UseCase<Asset[]> {
  public static Token = 'LIST_ASSETS_USE_CASE';

  constructor(
    @inject(AssetRepository.Token)
    private assetRepository: AssetRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<Asset[]>>}
   */
  public async execute(input: ListAssetsInput): Promise<Result<Asset[]>> {
    const { assetIds, limit, schema, owner, offset } = input;
    let query = ListAssetsQueryModel.create(input);

    if (assetIds.length > 0) {
      query = ListAssetsQueryModel.create({ assetIds });
    } else if (owner) {
      query = ListAssetsQueryModel.create({
        limit,
        schema,
        owner,
        skip: offset,
      });
    }

    return this.assetRepository.find(query);
  }
}
