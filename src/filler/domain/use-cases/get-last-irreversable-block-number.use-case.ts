/* eslint-disable @typescript-eslint/no-var-requires */

import { inject, injectable } from 'inversify';
import { EosDacRepository } from '../../../common/eos-dac/domain/eos-dac.repository';
import config from '../../../config';
import { Failure } from '../../../core/domain/failure';
import { Result } from '../../../core/domain/result';
import { UseCase } from '../../../core/domain/use-case';

@injectable()
export class GetLastIrreversableBlockNumUseCase extends UseCase<number> {
  public static Token = 'SETUP_STATE_RECEIVER_USE_CASE';

  constructor(
    @inject(EosDacRepository.Token) private eosDacRepository: EosDacRepository
  ) {
    super();
  }

  public async execute(): Promise<Result<number>> {
    console.log(`Fetching lib from ${config.endpoints[0]}/v1/chain/get_info`);
    const info = await this.eosDacRepository.getInfo();

    if (info instanceof Failure) {
      return Result.withFailure(info);
    }

    return Result.withContent(info.lastIrreversibleBlockNum);
  }
}
