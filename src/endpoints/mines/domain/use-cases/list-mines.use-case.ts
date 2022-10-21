import { Mine, MineRepository } from '@alien-worlds/alienworlds-api-common';
import { Result, UseCase } from '@alien-worlds/api-core';
import { inject, injectable } from 'inversify';
import { ListMinesInput } from '../models/list-mines.input';
import { ListMinesQueryModel } from '../models/list-mines.query-model';

/**
 * @class
 */
@injectable()
export class ListMinesUseCase implements UseCase<Mine[]> {
  public static Token = 'LIST_MINES_USE_CASE';

  constructor(
    @inject(MineRepository.Token)
    private mineRepository: MineRepository
  ) {}

  /**
   * @async
   * @param {string} scanKey
   * @returns {Promise<Result<Asset[]>>}
   */
  public async execute(input: ListMinesInput): Promise<Result<Mine[]>> {
    return this.mineRepository.find(ListMinesQueryModel.create(input));
  }
}
