import { ActionDto } from '@common/actions/data/actions.dtos';

/**
 * @class
 */
export class Action {
  /**
   *
   * @param {string} name - The name of the action as defined in the contract
   * @param {string} type - The name of the implicit struct as described in the ABI
   * @param {string=} ricardianContract - An optional ricardian clause to associate to this action describing its intended functionality.
   */
  private constructor(
    public readonly name: string,
    public readonly type: string,
    public readonly ricardianContract?: string
  ) {}

  /**
   * @returns {ActionDto}
   */
  public toDto(): ActionDto {
    const { name, type, ricardianContract } = this;
    return {
      name,
      type,
      ricardian_contract: ricardianContract,
    };
  }

  /**
   * @static
   * @param {ActionDto} dto
   * @returns {Action}
   */
  public static fromDto(dto: ActionDto): Action {
    const { name, type, ricardian_contract } = dto;
    return new Action(name, type, ricardian_contract);
  }
}
