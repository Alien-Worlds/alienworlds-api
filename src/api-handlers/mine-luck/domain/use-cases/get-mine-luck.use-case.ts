import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { MineLuck } from '../entities/mine-luck';
import { GetMineLuckInput } from '../models/get-mine-luck.input';
import { MineLuckRepository } from '../mine-luck.repository';

/**
 * @class
 */
@injectable()
export class GetMineLuckUseCase implements UseCase<MineLuck[]> {
  public static Token = 'GET_MINE_LUCK_USE_CASE';

  constructor(
    @inject(MineLuckRepository.Token)
    private mineLuckRepository: MineLuckRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<Asset[]>>}
   */
  public async execute(input: GetMineLuckInput): Promise<Result<MineLuck[]>> {
    const { from, to } = input;

    return this.mineLuckRepository.getMineLuck(from, to);
  }
}
