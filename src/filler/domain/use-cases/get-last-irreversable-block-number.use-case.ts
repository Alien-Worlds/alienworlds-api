/* eslint-disable @typescript-eslint/no-var-requires */

import { inject, injectable } from 'inversify';
import { EosDacRepository } from '../../../common/eos-dac/domain/eos-dac.repository';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';

@injectable()
export class GetLastIrreversableBlockNumUseCase extends UseCase<number> {
  public static Token = 'GET_LAST_IRREVERSABLE_BLOCK_NUMBER_USE_CASE';

  constructor(
    @inject(EosDacRepository.Token) private eosDacRepository: EosDacRepository
  ) {
    super();
  }

  public async execute(): Promise<Result<number>> {
    const { content, failure } = await this.eosDacRepository.getInfo();

    if (failure) {
      return Result.withFailure(failure);
    }

    return Result.withContent(content.lastIrreversibleBlockNum);
  }
}
