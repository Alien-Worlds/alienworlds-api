import { Result } from '@core/domain/result';
import { UseCase } from '@core/domain/use-case';
import { inject, injectable } from 'inversify';
import { Mine } from '../entities/mine';
import { MinesRepository } from '../mines.repository';

@injectable()
export class GetLastBlockUseCase implements UseCase<Mine> {
  public static Token = 'GET_LAST_BLOCK_USE_CASE';

  constructor(
    @inject(MinesRepository.Token) private minesRepository: MinesRepository
  ) {}

  public async execute(): Promise<Result<Mine>> {
    const result = await this.minesRepository.getLastBlock();
    if (result.isFailure) {
      // log failure
    }
    return result;
  }
}
