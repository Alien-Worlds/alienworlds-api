import { Request } from '@alien-worlds/api-core';
import { TokenRequestDto } from '../../data/dtos/token.dtos';

/**
 * @class
 */
export class GetTokenInput {
  /**
   *
   * @param {TokenRequestDto} dto
   * @returns {GetTokenInput}
   */
  public static fromRequest(
    request: Request<unknown, unknown, TokenRequestDto>
  ): GetTokenInput {
    const {
      query: { type, offset, id, owner, schema },
    } = request || {};
    return new GetTokenInput(id, type, offset, owner, schema);
  }
  /**
   *
   * @constructor
   * @private
   * @param {string} id
   * @param {string} type
   * @param {number} offset
   * @param {string} owner
   * @param {string} schema
   */
  private constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly offset: number,
    public readonly owner: string,
    public readonly schema: string
  ) {}
}
