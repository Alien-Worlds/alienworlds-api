import { Request } from '@alien-worlds/api-core';
import { parseToBigInt } from '@alien-worlds/api-core';
import { ListAssetsRequestDto } from '../../data/asset.dtos';

/**
 * @class
 */
export class ListAssetsInput {
  /**
   *
   * @param {ListAssetsRequestDto} dto
   * @returns {ListAssetsInput}
   */
  public static fromRequest(
    request: Request<unknown, unknown, ListAssetsRequestDto>
  ): ListAssetsInput {
    const { query } = request || {};
    const { limit, offset, id, owner, schema } = query || {};
    const assetIds = id ? id.split(',').map(item => parseToBigInt(item)) : [];

    return new ListAssetsInput(
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
