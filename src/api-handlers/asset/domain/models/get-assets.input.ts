import { AssetRequestDto } from '../../data/asset.dtos';

/**
 * @class
 */
export class GetAssetsInput {
  /**
   *
   * @param {AssetRequestDto} dto
   * @returns {GetAssetsInput}
   */
  public static fromRequest(dto: AssetRequestDto): GetAssetsInput {
    const { limit, offset, id, owner, schema } = dto;

    const assetIds = id ? id.split(',').map(item => BigInt(item)) : [];

    return new GetAssetsInput(
      Number(limit) || 20,
      Number(offset) || 0,
      assetIds,
      owner,
      schema
    );
  }
  /**
   *
   * @constructor
   * @private
   * @param {number} limit
   * @param {number} offset
   * @param {bigint[]} assetIds
   * @param {string} owner
   * @param {string} schema
   */
  private constructor(
    public readonly limit: number,
    public readonly offset: number,
    public readonly assetIds: bigint[],
    public readonly owner: string,
    public readonly schema: string
  ) {}
}
