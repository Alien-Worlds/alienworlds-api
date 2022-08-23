import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { ContractService } from '../domain/services/contract.service';
import { ContractInterface } from './token.dtos';

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
