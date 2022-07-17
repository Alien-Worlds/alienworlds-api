import { TokenRequestOptionsDto } from 'api-handlers/token/data/token.dtos';

/**
 * @class
 */
export class GetTokenInput {
  /**
   *
   * @param {TokenRequestOptionsDto} dto
   * @returns {GetTokenInput}
   */
  public static fromDto(dto: TokenRequestOptionsDto): GetTokenInput {
    const { type, offset, id, owner, schema } = dto;
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
