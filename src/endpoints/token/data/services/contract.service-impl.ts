import { Failure, Result } from '@alien-worlds/api-core';
import { ContractService } from '../../domain/services/contract.service';
import { ContractInterface } from '../dtos/token.dtos';

export class ContractServiceImpl implements ContractService {
  constructor(private contract: ContractInterface) {}

  /**
   * Get balance of the given account
   *
   * @async
   * @param {string} address account address
   * @returns {number} balance
   */
  public async getBalance(address: string): Promise<Result<number>> {
    try {
      const balance = await this.contract.balanceOf(address);
      return Result.withContent(+balance);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
