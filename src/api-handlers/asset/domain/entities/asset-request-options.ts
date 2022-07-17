import { AssetRequestQueryOptionsDto } from 'api-handlers/asset/data/asset.dtos';

/**
 * @class
 */
export class GetAssetsOptions {
  /**
   *
   * @param {AssetRequestQueryOptionsDto} dto
   * @returns {GetAssetsOptions}
   */
  public static fromDto(dto: AssetRequestQueryOptionsDto): GetAssetsOptions {
    const { limit, offset, id, owner, schema } = dto;
    return new GetAssetsOptions(
      limit || 20,
      offset || 0,
      id.split(',').map(item => BigInt(item)),
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
