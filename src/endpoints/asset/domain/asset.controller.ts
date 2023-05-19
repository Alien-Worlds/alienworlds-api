import { inject, injectable } from '@alien-worlds/api-core';
import { ListAssetsInput } from './models/list-assets.input';
import { ListAssetsUseCase } from './use-cases/list-assets.use-case';
import { ListAssetsOutput } from './models/list-assets.output';

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
  public async listAssets(input: ListAssetsInput): Promise<ListAssetsOutput> {
    const result = await this.listAssetsUseCase.execute(input);

    return ListAssetsOutput.create(result);
  }
}
