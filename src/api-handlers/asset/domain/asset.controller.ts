import { Asset } from '@common/assets/domain/entities/asset';
import { Result } from '@core/architecture/domain/result';
import { inject, injectable } from 'inversify';
import { ListAssetsInput } from './models/list-assets.input';
import { ListAssetsUseCase } from './use-cases/list-assets.use-case';

/**
 * @class
 */
@injectable()
export class AssetController {
  public static Token = 'ASSET_CONTROLLER';

  constructor(
    @inject(ListAssetsUseCase.Token)
    private listAssetsUseCase: ListAssetsUseCase
  ) {}

  /**
   * @async
   * @param {ListAssetsInput} input
   * @returns {Promise<Result<Asset[]>>}
   */
  public async listAssets(input: ListAssetsInput): Promise<Result<Asset[]>> {
    return this.listAssetsUseCase.execute(input);
  }
}
