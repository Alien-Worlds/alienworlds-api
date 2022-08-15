import { Asset } from '@common/assets/domain/entities/asset';
import { Result } from '@core/architecture/domain/result';
import { inject, injectable } from 'inversify';
import { GetAssetsInput } from './models/get-assets.input';
import { GetAssetsUseCase } from './use-cases/get-assets.use-case';

/**
 * @class
 */
@injectable()
export class AssetController {
  public static Token = 'ASSET_CONTROLLER';

  constructor(
    @inject(GetAssetsUseCase.Token) private getAssetsUseCase: GetAssetsUseCase
  ) {}

  /**
   * @async
   * @param {GetAssetsInput} input
   * @returns {Promise<Result<Asset[]>>}
   */
  public async getAssets(input: GetAssetsInput): Promise<Result<Asset[]>> {
    return this.getAssetsUseCase.execute(input);
  }
}
