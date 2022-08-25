import { inject, injectable } from 'inversify';
import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { MineLuck } from '../entities/mine-luck';
import { ListMineLuckInput } from '../models/list-mine-luck.input';
import { MineLuckRepository } from '../mine-luck.repository';

/**
 * @class
 */
@injectable()
export class ListMineLuckUseCase implements UseCase<MineLuck[]> {
  public static Token = 'LIST_MINE_LUCK_USE_CASE';

  constructor(
    @inject(MineLuckRepository.Token)
    private mineLuckRepository: MineLuckRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<Asset[]>>}
   */
  public async execute(input: ListMineLuckInput): Promise<Result<MineLuck[]>> {
    const { from, to } = input;

    return this.mineLuckRepository.listMineLuck(from, to);
  }
}
