import { Failure } from '@core/domain/failure';
import { Result } from '@core/domain/result';
import { UseCase } from '@core/domain/use-case';
import { inject, injectable } from 'inversify';
import { Mine } from '../entities/mine';
import { MinesRepository } from '../mines.repository';

@injectable()
export class GetLastBlockUseCase implements UseCase<Mine> {
  constructor(
    @inject(MinesRepository.Token) private minesRepository: MinesRepository
  ) {}

  public async execute(): Promise<Result<Mine | Failure>> {
    try {
      const entity = await this.minesRepository.getLastBlock();
      return Result.withContent(entity);
    } catch (error) {
      Result.withFailure(Failure.fromError(error));
    }
  }
}
